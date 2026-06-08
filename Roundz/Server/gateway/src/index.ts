import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import proxy from '@fastify/http-proxy';
import rateLimit from '@fastify/rate-limit';
import { corsOrigins, serviceDiscovery } from '@roundz/config';
import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createDomainEvent, createKafkaEventBus, createLogger, createRedisClient, EventTopics, loadServiceEnv } from '@roundz/common';
import { TrackingPositionSchema } from '@roundz/dto';

const serviceRoutes = [
  ['auth', '/v1/auth'],
  ['user', '/v1/users'],
  ['rider', '/v1/riders'],
  ['trip', '/v1/trips'],
  ['matching', '/v1/matching'],
  ['tracking', '/v1/tracking'],
  ['wallet', '/v1/wallets'],
  ['payment', '/v1/payments'],
  ['notification', '/v1/notifications'],
  ['analytics', '/v1/analytics'],
  ['admin', '/v1/admin'],
  ['kyc', '/v1/kyc']
] as const;

async function main() {
  const env = loadServiceEnv({ SERVICE_NAME: 'gateway', PORT: 3000 });
  const discovery = serviceDiscovery(env);
  const logger = createLogger('gateway', env.LOG_LEVEL);
  const app = Fastify({ logger: { level: env.LOG_LEVEL } });
  await app.register(cors, { origin: corsOrigins(env), credentials: true });
  await app.register(jwt, { secret: env.JWT_SECRET });
  const redisPub = createRedisClient(env);
  const redisSub = createRedisClient(env);
  const bus = createKafkaEventBus(env, logger);
  const io = new SocketServer(app.server, { cors: { origin: true, credentials: true }, path: '/socket.io' });

  await Promise.all([redisPub.connect(), redisSub.connect()]);
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    redis: redisPub,
    keyGenerator: (request) => request.headers.authorization ?? request.ip
  });

  app.addHook('onRequest', async (request, reply) => {
    const incomingTraceId = request.headers['x-request-id'];
    const traceId = Array.isArray(incomingTraceId) ? incomingTraceId[0] : incomingTraceId;
    reply.header('x-request-id', traceId ?? request.id);
  });

  app.setErrorHandler((error, request, reply) => {
    const gatewayError = error as Error & { statusCode?: number; code?: string };
    const statusCode = gatewayError.statusCode && gatewayError.statusCode >= 400 ? gatewayError.statusCode : 500;
    request.log.error({ error, traceId: request.id }, 'gateway request failed');
    void reply.code(statusCode).send({
      error: {
        message: statusCode >= 500 ? 'Internal gateway error' : gatewayError.message,
        code: gatewayError.code ?? 'ROUNDZ_GATEWAY_ERROR',
        traceId: request.id
      }
    });
  });

  app.get('/health', async () => ({ service: 'gateway', status: 'ok', timestamp: new Date().toISOString() }));

  for (const [serviceName, prefix] of serviceRoutes) {
    await app.register(proxy, {
      upstream: discovery[serviceName],
      prefix,
      rewritePrefix: prefix,
      websocket: true
    });
  }

  io.adapter(createAdapter(redisPub, redisSub));

  void bus.subscribe(EventTopics.NotificationRequested, 'gateway-notifications', async (event) => {
    io.emit('notification:new', event.payload);
  }).catch((error) => logger.error({ error }, 'gateway notification event bridge failed'));

  void bus.subscribe(EventTopics.TripStatusChanged, 'gateway-trip-status', async (event) => {
    io.to(`trip:${event.aggregateId}`).emit('trip:status', event.payload);
  }).catch((error) => logger.error({ error }, 'gateway trip status event bridge failed'));

  void bus.subscribe(EventTopics.TrackingPositionUpdated, 'gateway-tracking', async (event) => {
    io.to(`trip:${event.aggregateId}`).emit('tracking:position', event.payload);
  }).catch((error) => logger.error({ error }, 'gateway tracking event bridge failed'));

  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'socket connected');

    socket.on('trip:join', (tripId: string) => socket.join(`trip:${tripId}`));
    socket.on('rider:join', (riderId: string) => socket.join(`rider:${riderId}`));

    socket.on('tracking:position', async (payload, acknowledge?: (response: { ok: boolean; error?: string }) => void) => {
      try {
        const dto = TrackingPositionSchema.parse(payload);
        await bus.publish(createDomainEvent(EventTopics.TrackingPositionUpdated, dto.tripId, dto));
        io.to(`trip:${dto.tripId}`).emit('tracking:position', dto);
        if (dto.riderId) io.to(`rider:${dto.riderId}`).emit('tracking:position', dto);
        acknowledge?.({ ok: true });
      } catch (error) {
        acknowledge?.({ ok: false, error: error instanceof Error ? error.message : 'Invalid tracking payload' });
      }
    });
  });

  app.addHook('onClose', async () => {
    await bus.disconnect();
    redisPub.disconnect();
    redisSub.disconnect();
  });

  const shutdown = async (signal: NodeJS.Signals) => {
    app.log.info({ signal }, 'gateway graceful shutdown started');
    await app.close();
    app.log.info({ signal }, 'gateway graceful shutdown complete');
  };
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT', () => void shutdown('SIGINT'));

  await app.listen({ host: env.HOST, port: env.PORT });
}

void main();
