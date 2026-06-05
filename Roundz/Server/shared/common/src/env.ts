import { kafkaBrokers, loadRoundzConfig, RoundzConfigSchema, type RoundzConfig } from '@roundz/config';

export const serviceEnvSchema = RoundzConfigSchema;
export type ServiceEnv = RoundzConfig;

export function loadServiceEnv(overrides: Record<string, string | number | boolean | undefined> = {}): ServiceEnv {
  const effectiveOverrides = { ...overrides };
  if (process.env.PORT && 'PORT' in effectiveOverrides) {
    delete effectiveOverrides.PORT;
  }
  return loadRoundzConfig({ overrides: effectiveOverrides });
}

export { kafkaBrokers };
