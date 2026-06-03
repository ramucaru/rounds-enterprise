export type ServiceConfig = {
  serviceName: string;
  port: number;
  databaseUrl: string;
  redisUrl: string;
  kafkaBrokers: string[];
  mqttUrl: string;
  jwtSecret: string;
  awsRegion: string;
  snsPlatformApplicationArn?: string;
};

export function readServiceConfig(serviceName: string, defaultPort: number): ServiceConfig {
  return {
    serviceName,
    port: Number(process.env.PORT ?? defaultPort),
    databaseUrl: process.env.DATABASE_URL ?? 'postgres://roundz:roundz@localhost:5432/roundz',
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
    kafkaBrokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',').map((broker) => broker.trim()).filter(Boolean),
    mqttUrl: process.env.MQTT_URL ?? 'mqtt://localhost:1883',
    jwtSecret: process.env.JWT_SECRET ?? 'roundz-local-development-secret',
    awsRegion: process.env.AWS_REGION ?? 'us-east-1',
    snsPlatformApplicationArn: process.env.SNS_PLATFORM_APPLICATION_ARN
  };
}
