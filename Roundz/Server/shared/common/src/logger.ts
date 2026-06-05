import pino from 'pino';

export function createLogger(serviceName: string, level = 'info') {
  return pino({
    name: serviceName,
    level,
    base: { service: serviceName },
    timestamp: pino.stdTimeFunctions.isoTime
  });
}

export type RoundzLogger = ReturnType<typeof createLogger>;
