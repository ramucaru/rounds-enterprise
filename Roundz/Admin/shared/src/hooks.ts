import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRoundzSocket, RoundzApiClient } from './api-client.js';
import { getRoundzAdminStore, useRoundzAdminStore } from './store.js';

const api = new RoundzApiClient();

export function useOperations() {
  return useQuery({
    queryKey: ['operations'],
    queryFn: () => api.operations(),
    refetchInterval: getRoundzAdminStore().realtime.connected ? 10_000 : 30_000,
    retry: 2
  });
}

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => api.analyticsSummary(),
    staleTime: 30_000,
    retry: 2
  });
}

export function useStoredUser() {
  const selectedUserId = useRoundzAdminStore((state) => state.selectedUserId);
  return useQuery({
    queryKey: ['user', selectedUserId],
    queryFn: () => api.user(selectedUserId!),
    enabled: Boolean(selectedUserId),
    retry: 1
  });
}

export function useStoredWallet() {
  const userId = useRoundzAdminStore((state) => state.selectedWalletUserId ?? state.selectedUserId);
  return useQuery({
    queryKey: ['wallet', userId],
    queryFn: () => api.wallet(userId!),
    enabled: Boolean(userId),
    retry: 1
  });
}

export function useStoredTrackingPosition() {
  const tripId = useRoundzAdminStore((state) => state.selectedTripId);
  return useQuery({
    queryKey: ['tracking-position', tripId],
    queryFn: () => api.latestPosition(tripId!),
    enabled: Boolean(tripId),
    retry: 1
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.notify(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['operations'] });
    }
  });
}

export function useRoundzRealtime() {
  const queryClient = useQueryClient();
  const setRealtimeConnected = useRoundzAdminStore((state) => state.setRealtimeConnected);
  const addNotification = useRoundzAdminStore((state) => state.addNotification);
  const setSelectedIds = useRoundzAdminStore((state) => state.setSelectedIds);

  return () => {
    const socket = createRoundzSocket();
    socket.on('connect', () => setRealtimeConnected(true));
    socket.on('disconnect', () => setRealtimeConnected(false));
    socket.on('notification:new', (payload) => {
      addNotification(payload);
      void queryClient.invalidateQueries({ queryKey: ['operations'] });
    });
    socket.on('tracking:position', (payload: { tripId?: string }) => {
      if (payload.tripId) setSelectedIds({ selectedTripId: payload.tripId });
      void queryClient.invalidateQueries({ queryKey: ['tracking-position'] });
    });
    socket.connect();
    return () => {
      socket.disconnect();
    };
  };
}

