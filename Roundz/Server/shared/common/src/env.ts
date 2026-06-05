import { config as loadDotEnv } from 'dotenv';
import { z } from 'zod';

loadDotEnv({ path: process.env.DOTENV_CONFIG_PATH ?? '.env', quiet: true });

export const serviceEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  SERVICE_NAME: z.string().default('roundz-service'),
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_SECRET: z.string().min(12).default('roundz-local-development-secret'),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  MQTT_URL: z.string().url().default('mqtt://localhost:1883'),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ENDPOINT_URL: z.string().url().optional(),
  AWS_SNS_PLATFORM_APPLICATION_ARN: z.string().optional(),
  AWS_S3_BUCKET: z.string().default('roundz-documents'),
  FCM_PROJECT_ID: z.string().optional(),
  FCM_CLIENT_EMAIL: z.string().optional(),
  FCM_PRIVATE_KEY: z.string().optional()
});

export type ServiceEnv = z.infer<typeof serviceEnvSchema>;

export function loadServiceEnv(overrides: Record<string, string | number | undefined> = {}): ServiceEnv {
  return serviceEnvSchema.parse({ ...process.env, ...overrides });
}

export function kafkaBrokers(env: ServiceEnv): string[] {
  return env.KAFKA_BROKERS.split(',').map((broker) => broker.trim()).filter(Boolean);
}
