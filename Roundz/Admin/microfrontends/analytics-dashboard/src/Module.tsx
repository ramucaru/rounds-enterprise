import { useQuery } from '@tanstack/react-query';
import { RoundzApiClient } from '@roundz/admin-shared';

const api = new RoundzApiClient();

export default function Module() {
  const query = useQuery({
    queryKey: ['analytics-dashboard', '/v1/analytics/summary'],
    queryFn: () => api.request<unknown>('/v1/analytics/summary'),
    retry: 1
  });

  return (
    <section className="card">
      <h1>Analytics Dashboard</h1>
      <p>Connected to the Roundz gateway endpoint <code>/v1/analytics/summary</code>.</p>
      {query.isLoading && <p>Loading live data...</p>}
      {query.error && <p role="alert">Gateway request failed: {(query.error as Error).message}</p>}
      {query.data && <pre>{JSON.stringify(query.data, null, 2)}</pre>}
    </section>
  );
}
