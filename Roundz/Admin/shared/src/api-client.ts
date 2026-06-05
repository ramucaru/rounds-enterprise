import { io, type Socket } from 'socket.io-client';
import { loadAdminEnv } from './env.js';
import { getRoundzAdminStore, rememberApiPayload } from './store.js';

function gatewayBaseUrl(): string {
  return loadAdminEnv().VITE_API_BASE_URL;
}

export interface RoundzApiOptions {
  baseUrl?: string;
  token?: string;
}

export class RoundzApiClient {
  private readonly baseUrl: string;
  private token?: string;

  constructor(options: RoundzApiOptions = {}) {
    this.baseUrl = options.baseUrl ?? gatewayBaseUrl();
    this.token = options.token ?? getRoundzAdminStore().auth.token;
  }

  setToken(token: string) { this.token = token; }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...init.headers
      }
    });
    if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
    const payload = await response.json() as T;
    rememberApiPayload(path, payload);
    return payload;
  }

  analyticsSummary() { return this.request('/v1/analytics/summary'); }
  operations() { return this.request('/v1/admin/operations'); }
  user(userId: string) { return this.request(`/v1/users/${encodeURIComponent(userId)}`); }
  wallet(userId: string) { return this.request(`/v1/wallets/${encodeURIComponent(userId)}`); }
  latestPosition(tripId: string) { return this.request(`/v1/tracking/trips/${encodeURIComponent(tripId)}/latest`); }
  notify(body: unknown) { return this.request('/v1/notifications', { method: 'POST', body: JSON.stringify(body) }); }
}

export function createRoundzSocket(baseUrl = loadAdminEnv().VITE_SOCKET_URL): Socket {
  return io(baseUrl, { path: '/socket.io', transports: ['websocket'] });
}

