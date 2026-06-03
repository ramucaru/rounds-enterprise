import pino from 'pino';

export function createLogger(serviceName: string) {
  return pino({
    name: serviceName,
    level: process.env.LOG_LEVEL ?? 'info',
    base: { service: serviceName },
    timestamp: pino.stdTimeFunctions.isoTime
  });
}

export type RoundzLogger = ReturnType<typeof createLogger>;
