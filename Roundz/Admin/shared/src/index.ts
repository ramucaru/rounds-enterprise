import { io, type Socket } from 'socket.io-client';

function gatewayBaseUrl(): string {
  const meta = import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } };
  return meta.env?.VITE_API_BASE_URL ?? 'http://localhost:3000';
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
    this.token = options.token;
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
    return response.json() as Promise<T>;
  }

  analyticsSummary() { return this.request('/v1/analytics/summary'); }
  operations() { return this.request('/v1/admin/operations'); }
  notify(body: unknown) { return this.request('/v1/notifications', { method: 'POST', body: JSON.stringify(body) }); }
}

export function createRoundzSocket(baseUrl = gatewayBaseUrl()): Socket {
  return io(baseUrl, { path: '/socket.io', transports: ['websocket'] });
}

export const moduleCards = [
  { path: '/users', title: 'User Management' },
  { path: '/riders', title: 'Rider Management' },
  { path: '/trips', title: 'Trip Monitoring' },
  { path: '/wallets', title: 'Wallet Management' },
  { path: '/analytics', title: 'Analytics Dashboard' },
  { path: '/notifications', title: 'Notification Center' },
  { path: '/support', title: 'Support System' }
];
