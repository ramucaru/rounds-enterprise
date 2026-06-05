import { useAnalyticsSummary, useRoundzAdminStore } from '@roundz/admin-shared';

export default function Module() {
  const query = useAnalyticsSummary();
  const cached = useRoundzAdminStore((state) => state.apiCache['/v1/analytics/summary']);
  return (
    <section className="card">
      <h1>Analytics Dashboard</h1>
      <p>Analytics are fetched from the backend and cached in the shared Admin store for offline-safe reloads.</p>
      {query.isLoading && <p>Loading analytics...</p>}
      {query.error && cached && <p role="alert">Showing cached analytics because refresh failed.</p>}
      {query.error && !cached && <p role="alert">Gateway request failed: {(query.error as Error).message}</p>}
      {(query.data ?? cached?.data) !== undefined && <pre>{JSON.stringify(query.data ?? cached?.data, null, 2)}</pre>}
    </section>
  );
}
