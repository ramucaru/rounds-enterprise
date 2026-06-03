import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { type Pool } from 'pg';
import { createDbPool, ensureSchema } from './db.js';
import { loadServiceEnv, type ServiceEnv } from './env.js';
import { createKafkaEventBus, type EventBus } from './kafka.js';
import { createLogger, type RoundzLogger } from './logger.js';
import { createRedisClient } from './redis.js';
import type Redis from 'ioredis';

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
  const env = loadServiceEnv({ SERVICE_NAME: options.name, PORT: process.env.PORT ?? options.defaultPort });
  const logger = createLogger(options.name);
  const app = Fastify({ loggerInstance: logger });
  await app.register(cors, { origin: true, credentials: true });
  await app.register(jwt, { secret: env.JWT_SECRET });

  const db = env.DATABASE_URL ? createDbPool(env.DATABASE_URL) : undefined;
  if (db) await ensureSchema(db);
  const redis = createRedisClient(env);
  const bus = createKafkaEventBus(env, logger);
  const context: ServiceContext = { env, logger, db, redis, bus };

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
  const env = loadServiceEnv({ SERVICE_NAME: options.name, PORT: process.env.PORT ?? options.defaultPort });
  await app.listen({ host: '0.0.0.0', port: env.PORT });
}

export function requireDb(context: ServiceContext): Pool {
  if (!context.db) throw new Error('DATABASE_URL is required for this endpoint');
  return context.db;
}
