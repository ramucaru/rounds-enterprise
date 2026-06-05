import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const storageKey = 'roundz.admin.store.v1';

export type EntityType = 'users' | 'riders' | 'trips' | 'wallets' | 'notifications' | 'analytics' | 'tracking' | 'operations';

export interface AuthState {
  token?: string;
  refreshToken?: string;
  expiresAt?: string;
  roles: string[];
  permissions: string[];
  user?: unknown;
}

export interface RoundzAdminStoreState {
  auth: AuthState;
  selectedUserId?: string;
  selectedRiderId?: string;
  selectedTripId?: string;
  selectedWalletUserId?: string;
  theme: 'dark' | 'light' | 'system';
  realtime: {
    connected: boolean;
    lastEventAt?: string;
  };
  filters: Record<string, Record<string, unknown>>;
  pagination: Record<string, { page: number; pageSize: number }>;
  lastEndpoint?: string;
  entities: Record<EntityType, Record<string, unknown>>;
  apiCache: Record<string, { data: unknown; updatedAt: string }>;
  notifications: unknown[];
  setAuth: (auth: Partial<AuthState>) => void;
  clearAuth: () => void;
  setSelectedIds: (ids: Partial<Pick<RoundzAdminStoreState, 'selectedUserId' | 'selectedRiderId' | 'selectedTripId' | 'selectedWalletUserId'>>) => void;
  setFilter: (scope: string, filter: Record<string, unknown>) => void;
  setPagination: (scope: string, page: number, pageSize: number) => void;
  setRealtimeConnected: (connected: boolean) => void;
  upsertEntity: (type: EntityType, id: string, value: unknown) => void;
  rememberApiPayload: (endpoint: string, payload: unknown) => void;
  addNotification: (notification: unknown) => void;
  reset: () => void;
}

const emptyEntities: Record<EntityType, Record<string, unknown>> = {
  users: {},
  riders: {},
  trips: {},
  wallets: {},
  notifications: {},
  analytics: {},
  tracking: {},
  operations: {}
};

export const useRoundzAdminStore = create<RoundzAdminStoreState>()(
  persist(
    (set, get) => ({
      auth: { roles: [], permissions: [] },
      theme: 'system',
      realtime: { connected: false },
      filters: {},
      pagination: {},
      entities: emptyEntities,
      apiCache: {},
      notifications: [],
      setAuth: (auth) => set((state) => ({ auth: { ...state.auth, ...auth } })),
      clearAuth: () => set({ auth: { roles: [], permissions: [] } }),
      setSelectedIds: (ids) => set(ids),
      setFilter: (scope, filter) => set((state) => ({ filters: { ...state.filters, [scope]: filter } })),
      setPagination: (scope, page, pageSize) => set((state) => ({ pagination: { ...state.pagination, [scope]: { page, pageSize } } })),
      setRealtimeConnected: (connected) => set({ realtime: { connected, lastEventAt: new Date().toISOString() } }),
      upsertEntity: (type, id, value) => set((state) => ({
        entities: {
          ...state.entities,
          [type]: { ...state.entities[type], [id]: value }
        }
      })),
      rememberApiPayload: (endpoint, payload) => {
        const ids = extractKnownIds(payload);
        const normalized = normalizePayload(payload);
        set((state) => ({
          ...ids,
          lastEndpoint: endpoint,
          entities: mergeEntities(state.entities, normalized),
          apiCache: {
            ...state.apiCache,
            [endpoint]: { data: payload, updatedAt: new Date().toISOString() }
          }
        }));
      },
      addNotification: (notification) => set((state) => ({ notifications: [notification, ...state.notifications].slice(0, 100) })),
      reset: () => set({
        auth: { roles: [], permissions: [] },
        selectedUserId: undefined,
        selectedRiderId: undefined,
        selectedTripId: undefined,
        selectedWalletUserId: undefined,
        theme: 'system',
        realtime: { connected: false },
        filters: {},
        pagination: {},
        entities: emptyEntities,
        apiCache: {},
        notifications: []
      })
    }),
    {
      name: storageKey,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        auth: state.auth,
        selectedUserId: state.selectedUserId,
        selectedRiderId: state.selectedRiderId,
        selectedTripId: state.selectedTripId,
        selectedWalletUserId: state.selectedWalletUserId,
        theme: state.theme,
        filters: state.filters,
        pagination: state.pagination,
        entities: state.entities,
        apiCache: state.apiCache,
        notifications: state.notifications
      })
    }
  )
);

export function getRoundzAdminStore(): RoundzAdminStoreState {
  return useRoundzAdminStore.getState();
}

export function clearRoundzAdminStore() {
  useRoundzAdminStore.getState().reset();
}

export function storeEntity(key: string, value: unknown) {
  useRoundzAdminStore.getState().upsertEntity('operations', key, value);
}

export function rememberApiPayload(endpoint: string, payload: unknown) {
  useRoundzAdminStore.getState().rememberApiPayload(endpoint, payload);
}

function extractKnownIds(payload: unknown): Partial<RoundzAdminStoreState> {
  const found: Partial<RoundzAdminStoreState> = {};
  visit(payload, (key, value) => {
    if (typeof value !== 'string' || value.length < 8) return;
    if (key === 'token') found.auth = { ...getRoundzAdminStore().auth, token: value };
    if (key === 'refreshToken') found.auth = { ...getRoundzAdminStore().auth, refreshToken: value };
    if (key === 'userId' || key === 'user_id' || key === 'customer_id' || key === 'customerId') found.selectedUserId = value;
    if (key === 'riderId' || key === 'rider_id') found.selectedRiderId = value;
    if (key === 'tripId' || key === 'trip_id') found.selectedTripId = value;
    if (key === 'walletUserId') found.selectedWalletUserId = value;
  });
  return found;
}

function normalizePayload(payload: unknown): Record<EntityType, Record<string, unknown>> {
  const normalized = structuredCloneSafe(emptyEntities);
  visit(payload, (_key, value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    const record = value as Record<string, unknown>;
    const id = typeof record.id === 'string' ? record.id : undefined;
    if (!id) return;
    if ('email' in record || 'full_name' in record || 'fullName' in record) normalized.users[id] = record;
    if ('vehicle_type' in record || 'vehicleType' in record || 'online_status' in record) normalized.riders[id] = record;
    if ('pickup_address' in record || 'pickupAddress' in record || 'quoted_fare_cents' in record) normalized.trips[id] = record;
    if ('balance_cents' in record || 'balanceCents' in record) normalized.wallets[id] = record;
    if ('channel' in record && 'title' in record) normalized.notifications[id] = record;
  });
  return normalized;
}

function mergeEntities(current: Record<EntityType, Record<string, unknown>>, next: Record<EntityType, Record<string, unknown>>) {
  return (Object.keys(current) as EntityType[]).reduce<Record<EntityType, Record<string, unknown>>>((merged, key) => {
    merged[key] = { ...current[key], ...next[key] };
    return merged;
  }, structuredCloneSafe(emptyEntities));
}

function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function visit(value: unknown, onValue: (key: string, value: unknown) => void) {
  if (Array.isArray(value)) {
    value.forEach((item) => visit(item, onValue));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    onValue(key, child);
    visit(child, onValue);
  }
}

