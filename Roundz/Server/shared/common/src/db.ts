import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import { schemaSql } from './migrations.js';

export type DbPool = Pool;

export function createDbPool(databaseUrl: string): Pool {
  return new Pool({
    connectionString: databaseUrl,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    application_name: process.env.SERVICE_NAME ?? 'roundz-service'
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
