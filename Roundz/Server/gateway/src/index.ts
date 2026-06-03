import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import proxy from '@fastify/http-proxy';
import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createDomainEvent, createKafkaEventBus, createLogger, createRedisClient, EventTopics, loadServiceEnv } from '@roundz/common';
import { TrackingPositionSchema } from '@roundz/dto';

const serviceRoutes = [
  ['AUTH_SERVICE_URL', '/v1/auth', 'http://localhost:3010'],
  ['USER_SERVICE_URL', '/v1/users', 'http://localhost:3011'],
  ['RIDER_SERVICE_URL', '/v1/riders', 'http://localhost:3012'],
  ['TRIP_SERVICE_URL', '/v1/trips', 'http://localhost:3013'],
  ['MATCHING_SERVICE_URL', '/v1/matching', 'http://localhost:3014'],
  ['TRACKING_SERVICE_URL', '/v1/tracking', 'http://localhost:3015'],
  ['WALLET_SERVICE_URL', '/v1/wallets', 'http://localhost:3016'],
  ['PAYMENT_SERVICE_URL', '/v1/payments', 'http://localhost:3017'],
  ['NOTIFICATION_SERVICE_URL', '/v1/notifications', 'http://localhost:3018'],
  ['ANALYTICS_SERVICE_URL', '/v1/analytics', 'http://localhost:3019'],
  ['ADMIN_SERVICE_URL', '/v1/admin', 'http://localhost:3020'],
  ['KYC_SERVICE_URL', '/v1/kyc', 'http://localhost:3021']
] as const;

async function main() {
  const env = loadServiceEnv({ SERVICE_NAME: 'gateway', PORT: process.env.GATEWAY_PORT ?? process.env.PORT ?? 3000 });
  const logger = createLogger('gateway');
  const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'info' } });
  await app.register(cors, { origin: true, credentials: true });
  await app.register(jwt, { secret: env.JWT_SECRET });

  app.get('/health', async () => ({ service: 'gateway', status: 'ok', timestamp: new Date().toISOString() }));

  for (const [envName, prefix, fallback] of serviceRoutes) {
    await app.register(proxy, {
      upstream: process.env[envName] ?? fallback,
      prefix,
      rewritePrefix: prefix,
      websocket: true
    });
  }

  const redisPub = createRedisClient(env);
  const redisSub = createRedisClient(env);
  const bus = createKafkaEventBus(env, logger);
  const io = new SocketServer(app.server, { cors: { origin: true, credentials: true }, path: '/socket.io' });

  await Promise.all([redisPub.connect(), redisSub.connect()]);
  io.adapter(createAdapter(redisPub, redisSub));

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

  await app.listen({ host: '0.0.0.0', port: env.PORT });
}

void main();
