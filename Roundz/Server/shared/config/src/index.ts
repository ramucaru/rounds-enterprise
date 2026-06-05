import { config as loadDotEnv } from 'dotenv';
import { z, type ZodError } from 'zod';

export const RuntimeEnvironmentSchema = z.enum(['local', 'development', 'test', 'staging', 'production']);
export type RuntimeEnvironment = z.infer<typeof RuntimeEnvironmentSchema>;

export const LogLevelSchema = z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']);
export type LogLevel = z.infer<typeof LogLevelSchema>;

const optionalUrl = z.string().url().optional();

export const RoundzConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  APP_ENV: RuntimeEnvironmentSchema.default('development'),
  SERVICE_NAME: z.string().min(1).default('roundz-service'),
  SERVICE_VERSION: z.string().default('0.1.0'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: LogLevelSchema.default('info'),
  CORS_ORIGINS: z.string().default('http://localhost:5100,http://localhost:3000'),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),

  DATABASE_URL: z.string().url().default('postgres://roundz:roundz@localhost:5432/roundz'),
  POSTGRES_POOL_MAX: z.coerce.number().int().positive().default(20),
  POSTGRES_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  POSTGRES_CONNECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),

  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  REDIS_MAX_RETRIES_PER_REQUEST: z.coerce.number().int().positive().default(3),
  REDIS_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),

  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_CLIENT_ID: z.string().default('roundz-platform'),
  KAFKA_GROUP_ID: z.string().default('roundz-service'),
  KAFKA_SSL: z.coerce.boolean().default(false),

  MQTT_URL: z.string().url().default('mqtt://localhost:1883'),
  MQTT_USERNAME: z.string().optional(),
  MQTT_PASSWORD: z.string().optional(),

  JWT_SECRET: z.string().min(12).default('roundz-local-development-secret'),
  JWT_ACCESS_TOKEN_TTL: z.string().default('15m'),
  JWT_REFRESH_TOKEN_TTL: z.string().default('30d'),

  AWS_REGION: z.string().default('us-east-1'),
  AWS_ENDPOINT_URL: optionalUrl,
  AWS_S3_BUCKET: z.string().default('roundz-local-documents'),
  AWS_SNS_PLATFORM_APPLICATION_ARN: z.string().optional(),
  FCM_PROJECT_ID: z.string().optional(),
  FCM_CLIENT_EMAIL: z.string().optional(),
  FCM_PRIVATE_KEY: z.string().optional(),

  GATEWAY_PUBLIC_URL: z.string().url().default('http://localhost:3000'),
  AUTH_SERVICE_URL: z.string().url().default('http://localhost:3010'),
  USER_SERVICE_URL: z.string().url().default('http://localhost:3011'),
  RIDER_SERVICE_URL: z.string().url().default('http://localhost:3012'),
  TRIP_SERVICE_URL: z.string().url().default('http://localhost:3013'),
  MATCHING_SERVICE_URL: z.string().url().default('http://localhost:3014'),
  TRACKING_SERVICE_URL: z.string().url().default('http://localhost:3015'),
  WALLET_SERVICE_URL: z.string().url().default('http://localhost:3016'),
  PAYMENT_SERVICE_URL: z.string().url().default('http://localhost:3017'),
  NOTIFICATION_SERVICE_URL: z.string().url().default('http://localhost:3018'),
  ANALYTICS_SERVICE_URL: z.string().url().default('http://localhost:3019'),
  ADMIN_SERVICE_URL: z.string().url().default('http://localhost:3020'),
  KYC_SERVICE_URL: z.string().url().default('http://localhost:3021'),

  METRICS_ENABLED: z.coerce.boolean().default(true),
  TRACING_ENABLED: z.coerce.boolean().default(false)
});

export type RoundzConfig = z.infer<typeof RoundzConfigSchema>;

export interface ConfigLoadOptions {
  envFile?: string;
  overrides?: Record<string, string | number | boolean | undefined>;
  env?: NodeJS.ProcessEnv;
}

let dotenvLoaded = false;

export function loadEnvFile(envFile = process.env.DOTENV_CONFIG_PATH ?? '.env'): void {
  if (dotenvLoaded) return;
  loadDotEnv({ path: envFile, quiet: true });
  dotenvLoaded = true;
}

export function formatConfigError(error: ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
}

export function loadRoundzConfig(options: ConfigLoadOptions = {}): RoundzConfig {
  loadEnvFile(options.envFile);
  const source = { ...(options.env ?? process.env), ...(options.overrides ?? {}) };
  const parsed = RoundzConfigSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Invalid Roundz environment configuration: ${formatConfigError(parsed.error)}`);
  }
  return parsed.data;
}

export function kafkaBrokers(config: Pick<RoundzConfig, 'KAFKA_BROKERS'>): string[] {
  return config.KAFKA_BROKERS.split(',').map((broker) => broker.trim()).filter(Boolean);
}

export function corsOrigins(config: Pick<RoundzConfig, 'CORS_ORIGINS'>): string[] | boolean {
  const origins = config.CORS_ORIGINS.trim();
  if (origins === '*') return true;
  return origins.split(',').map((origin) => origin.trim()).filter(Boolean);
}

export function serviceDiscovery(config: RoundzConfig) {
  return {
    auth: config.AUTH_SERVICE_URL,
    user: config.USER_SERVICE_URL,
    rider: config.RIDER_SERVICE_URL,
    trip: config.TRIP_SERVICE_URL,
    matching: config.MATCHING_SERVICE_URL,
    tracking: config.TRACKING_SERVICE_URL,
    wallet: config.WALLET_SERVICE_URL,
    payment: config.PAYMENT_SERVICE_URL,
    notification: config.NOTIFICATION_SERVICE_URL,
    analytics: config.ANALYTICS_SERVICE_URL,
    admin: config.ADMIN_SERVICE_URL,
    kyc: config.KYC_SERVICE_URL
  } as const;
}

export function redactConfig(config: RoundzConfig): Record<string, unknown> {
  return Object.fromEntries(Object.entries(config).map(([key, value]) => [key, /SECRET|PASSWORD|PRIVATE_KEY|TOKEN/i.test(key) ? '[REDACTED]' : value]));
}
