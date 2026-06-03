import { RoundzApiClient } from '@roundz/shared';

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

export function createAdminApi(baseUrl = env?.VITE_ROUNDZ_API_URL ?? 'http://localhost:8080') {
  return new RoundzApiClient(baseUrl);
}
