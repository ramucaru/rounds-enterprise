import fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import Redis from 'ioredis';
import mqtt, { type MqttClient } from 'mqtt';
import { Pool } from 'pg';
import { EventBus } from './event-bus.js';
import { migrateDatabase } from './database.js';
import { PushNotificationClient } from './notifications.js';
import type { ServiceConfig } from './config.js';

export type Runtime = {
  config: ServiceConfig;
  db: Pool;
  redis: Redis;
  events: EventBus;
  mqtt: MqttClient;
  push: PushNotificationClient;
};

export type RouteInstaller = (app: FastifyInstance, runtime: Runtime) => Promise<void> | void;

export async function createService(config: ServiceConfig, installRoutes: RouteInstaller): Promise<{ app: FastifyInstance; runtime: Runtime }> {
  const app = fastify({ logger: true });
  await app.register(cors, { origin: true, credentials: true });
  await app.register(jwt, { secret: config.jwtSecret });

  const db = new Pool({ connectionString: config.databaseUrl });
  await migrateDatabase(db);

  const runtime: Runtime = {
    config,
    db,
    redis: new Redis(config.redisUrl, { lazyConnect: true }),
    events: new EventBus(config.serviceName, config.kafkaBrokers),
    mqtt: mqtt.connect(config.mqttUrl, { reconnectPeriod: 2000 }),
    push: new PushNotificationClient(config.awsRegion)
  };

  app.get('/health', async () => ({ service: config.serviceName, status: 'ok', time: new Date().toISOString() }));

  await installRoutes(app, runtime);

  app.addHook('onClose', async () => {
    await runtime.events.disconnect();
    await runtime.redis.quit();
    runtime.mqtt.end();
    await runtime.db.end();
  });

  return { app, runtime };
}

export async function startService(config: ServiceConfig, installRoutes: RouteInstaller): Promise<void> {
  const { app } = await createService(config, installRoutes);
  await app.listen({ port: config.port, host: '0.0.0.0' });
}
