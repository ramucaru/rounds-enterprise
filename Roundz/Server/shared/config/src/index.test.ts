import { describe, expect, it } from 'vitest';
import { corsOrigins, kafkaBrokers, loadRoundzConfig, serviceDiscovery } from './index.js';

describe('@roundz/config', () => {
  it('loads typed defaults and overrides', () => {
    const config = loadRoundzConfig({ envFile: '.env.missing', overrides: { SERVICE_NAME: 'gateway', PORT: '3999', JWT_SECRET: 'local-secret-value' }, env: {} as NodeJS.ProcessEnv });
    expect(config.PORT).toBe(3999);
    expect(config.SERVICE_NAME).toBe('gateway');
    expect(serviceDiscovery(config).auth).toBe('http://localhost:3010');
  });

  it('normalizes kafka brokers and cors origins', () => {
    const config = loadRoundzConfig({ envFile: '.env.missing', overrides: { JWT_SECRET: 'local-secret-value', KAFKA_BROKERS: 'a:9092, b:9092', CORS_ORIGINS: 'http://localhost:5100,http://localhost:3000' }, env: {} as NodeJS.ProcessEnv });
    expect(kafkaBrokers(config)).toEqual(['a:9092', 'b:9092']);
    expect(corsOrigins(config)).toEqual(['http://localhost:5100', 'http://localhost:3000']);
  });
});
