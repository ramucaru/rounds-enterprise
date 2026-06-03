import Redis from 'ioredis';
import type { ServiceEnv } from './env.js';

export function createRedisClient(env: ServiceEnv): Redis {
  return new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true
  });
}

export async function cacheJson(client: Redis, key: string, value: unknown, ttlSeconds: number): Promise<void> {
  await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

export async function readJson<T>(client: Redis, key: string): Promise<T | null> {
  const value = await client.get(key);
  return value ? (JSON.parse(value) as T) : null;
}
