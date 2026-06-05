import pino, { type LoggerOptions } from 'pino';

export interface LoggerContext {
  serviceName: string;
  level?: string;
  version?: string;
}

export function createStructuredLogger(context: LoggerContext, options: LoggerOptions = {}) {
  return pino({
    name: context.serviceName,
    level: context.level ?? 'info',
    base: { service: context.serviceName, version: context.version ?? '0.1.0' },
    timestamp: pino.stdTimeFunctions.isoTime,
    ...options
  });
}

export type RoundzStructuredLogger = ReturnType<typeof createStructuredLogger>;
