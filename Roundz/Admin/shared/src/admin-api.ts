import { RoundzApiClient } from '@roundz/shared';

export function createAdminApi(baseUrl = import.meta.env?.VITE_ROUNDZ_API_URL ?? 'http://localhost:8080') {
  return new RoundzApiClient(baseUrl);
}
