import fastify from 'fastify';
import cors from '@fastify/cors';
import proxy from '@fastify/http-proxy';
import { Server } from 'socket.io';
import { ROUNDZ_SERVICE_PORTS } from '@roundz/shared';

const app = fastify({ logger: true });
await app.register(cors, { origin: true, credentials: true });

const serviceTargets = {
  auth: process.env.AUTH_SERVICE_URL ?? `http://localhost:${ROUNDZ_SERVICE_PORTS.auth}`,
  users: process.env.USER_SERVICE_URL ?? `http://localhost:${ROUNDZ_SERVICE_PORTS.user}`,
  riders: process.env.RIDER_SERVICE_URL ?? `http://localhost:${ROUNDZ_SERVICE_PORTS.rider}`,
  trips: process.env.TRIP_SERVICE_URL ?? `http://localhost:${ROUNDZ_SERVICE_PORTS.trip}`,
  matching: process.env.MATCHING_SERVICE_URL ?? `http://localhost:${ROUNDZ_SERVICE_PORTS.matching}`,
  tracking: process.env.TRACKING_SERVICE_URL ?? `http://localhost:${ROUNDZ_SERVICE_PORTS.tracking}`,
  wallets: process.env.WALLET_SERVICE_URL ?? `http://localhost:${ROUNDZ_SERVICE_PORTS.wallet}`,
  payments: process.env.PAYMENT_SERVICE_URL ?? `http://localhost:${ROUNDZ_SERVICE_PORTS.payment}`,
  notifications: process.env.NOTIFICATION_SERVICE_URL ?? `http://localhost:${ROUNDZ_SERVICE_PORTS.notification}`,
  analytics: process.env.ANALYTICS_SERVICE_URL ?? `http://localhost:${ROUNDZ_SERVICE_PORTS.analytics}`,
  admin: process.env.ADMIN_SERVICE_URL ?? `http://localhost:${ROUNDZ_SERVICE_PORTS.admin}`,
  kyc: process.env.KYC_SERVICE_URL ?? `http://localhost:${ROUNDZ_SERVICE_PORTS.kyc}`
};

await Promise.all(Object.entries(serviceTargets).map(([prefix, upstream]) =>
  app.register(proxy, { upstream, prefix: `/api/${prefix}`, rewritePrefix: `/${prefix === 'users' ? 'users' : prefix}` })
));

app.get('/health', async () => ({ service: 'gateway', status: 'ok', services: serviceTargets }));

const io = new Server(app.server, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  socket.on('trip:join', (tripId: string) => socket.join(`trip:${tripId}`));
  socket.on('trip:location', (payload) => io.to(`trip:${payload.tripId}`).emit('trip:location', payload));
});

await app.listen({ port: Number(process.env.PORT ?? ROUNDZ_SERVICE_PORTS.gateway), host: '0.0.0.0' });
