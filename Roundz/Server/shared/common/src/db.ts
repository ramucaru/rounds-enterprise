import type { ServiceEnv } from './env.js';
import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import { schemaSql } from './migrations.js';

export type DbPool = Pool;

export function createDbPool(databaseUrl: string, env?: ServiceEnv): Pool {
  return new Pool({
    connectionString: databaseUrl,
    max: env?.POSTGRES_POOL_MAX ?? 20,
    idleTimeoutMillis: env?.POSTGRES_IDLE_TIMEOUT_MS ?? 30_000,
    connectionTimeoutMillis: env?.POSTGRES_CONNECTION_TIMEOUT_MS ?? 5_000,
    application_name: env?.SERVICE_NAME ?? 'roundz-service'
  });
}

export async function ensureSchema(pool: Pool): Promise<void> {
  await pool.query(schemaSql);
}

export async function queryOne<T extends QueryResultRow>(pool: Pool, sql: string, values: unknown[] = []): Promise<T | null> {
  const result: QueryResult<T> = await pool.query(sql, values);
  return result.rows[0] ?? null;
}

export async function withTransaction<T>(pool: Pool, work: (client: Pool) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const transactionalPool = client as unknown as Pool;
    const value = await work(transactionalPool);
    await client.query('COMMIT');
    return value;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
