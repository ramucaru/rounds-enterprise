import { Redis } from 'ioredis';
import type { ServiceEnv } from './env.js';

export function createRedisClient(env: ServiceEnv): Redis {
  return new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: env.REDIS_MAX_RETRIES_PER_REQUEST,
    connectTimeout: env.REDIS_CONNECT_TIMEOUT_MS,
    enableReadyCheck: true,
    retryStrategy(times) {
      return Math.min(times * 250, 5_000);
    }
  });
}

export async function cacheJson(client: Redis, key: string, value: unknown, ttlSeconds: number): Promise<void> {
  await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

export async function readJson<T>(client: Redis, key: string): Promise<T | null> {
  const value = await client.get(key);
  return value ? (JSON.parse(value) as T) : null;
}
