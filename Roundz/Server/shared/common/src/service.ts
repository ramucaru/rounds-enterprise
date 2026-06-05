import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { corsOrigins } from '@roundz/config';
import { type Pool } from 'pg';
import { createDbPool, ensureSchema } from './db.js';
import { loadServiceEnv, type ServiceEnv } from './env.js';
import { createKafkaEventBus, type EventBus } from './kafka.js';
import { createLogger, type RoundzLogger } from './logger.js';
import { createRedisClient } from './redis.js';
import type { Redis } from 'ioredis';

export interface ServiceContext {
  env: ServiceEnv;
  logger: RoundzLogger;
  db?: Pool;
  redis: Redis;
  bus: EventBus;
}

export interface ServiceOptions {
  name: string;
  defaultPort: number;
  registerRoutes: (app: FastifyInstance, context: ServiceContext) => Promise<void> | void;
}

export async function buildService(options: ServiceOptions): Promise<FastifyInstance> {
  const env = loadServiceEnv({ SERVICE_NAME: options.name, PORT: options.defaultPort });
  const logger = createLogger(options.name, env.LOG_LEVEL);
  const app = Fastify({ logger: { level: env.LOG_LEVEL } });
  await app.register(cors, { origin: corsOrigins(env), credentials: true });
  await app.register(jwt, { secret: env.JWT_SECRET });

  const db = env.DATABASE_URL ? createDbPool(env.DATABASE_URL, env) : undefined;
  if (db) await ensureSchema(db);
  const redis = createRedisClient(env);
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    redis,
    keyGenerator: (request) => request.headers.authorization ?? request.ip
  });
  const bus = createKafkaEventBus(env, logger);
  const context: ServiceContext = { env, logger, db, redis, bus };

  app.addHook('onRequest', async (request, reply) => {
    const incomingTraceId = request.headers['x-request-id'];
    const traceId = Array.isArray(incomingTraceId) ? incomingTraceId[0] : incomingTraceId;
    reply.header('x-request-id', traceId ?? request.id);
  });

  app.setErrorHandler((error, request, reply) => {
    const roundzError = error as Error & { statusCode?: number; code?: string };
    const statusCode = roundzError.statusCode && roundzError.statusCode >= 400 ? roundzError.statusCode : 500;
    request.log.error({ error, traceId: request.id }, 'request failed');
    void reply.code(statusCode).send({
      error: {
        message: statusCode >= 500 ? 'Internal server error' : roundzError.message,
        code: roundzError.code ?? 'ROUNDZ_REQUEST_ERROR',
        traceId: request.id
      }
    });
  });

  app.get('/health', async () => ({ service: options.name, status: 'ok', timestamp: new Date().toISOString() }));
  app.get('/ready', async () => {
    if (db) await db.query('SELECT 1');
    return { service: options.name, ready: true };
  });

  await options.registerRoutes(app, context);

  app.addHook('onClose', async () => {
    await bus.disconnect();
    redis.disconnect();
    if (db) await db.end();
  });

  return app;
}

export async function startService(options: ServiceOptions): Promise<void> {
  const app = await buildService(options);
  const env = loadServiceEnv({ SERVICE_NAME: options.name, PORT: options.defaultPort });
  const shutdown = async (signal: NodeJS.Signals) => {
    app.log.info({ signal }, 'graceful shutdown started');
    await app.close();
    app.log.info({ signal }, 'graceful shutdown complete');
  };
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT', () => void shutdown('SIGINT'));
  await app.listen({ host: env.HOST, port: env.PORT });
}

export function requireDb(context: ServiceContext): Pool {
  if (!context.db) throw new Error('DATABASE_URL is required for this endpoint');
  return context.db;
}
