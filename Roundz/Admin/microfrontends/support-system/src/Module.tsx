import { useOperations, useRoundzAdminStore } from '@roundz/admin-shared';

export default function Module() {
  const query = useOperations();
  const lastEndpoint = useRoundzAdminStore((state) => state.lastEndpoint);
  return (
    <section className="card">
      <h1>Support System</h1>
      <p>Support uses the shared operations cache and selected user/trip context from other microfrontends.</p>
      <p>Last API endpoint persisted: <strong>{lastEndpoint ?? 'none'}</strong></p>
      {query.isLoading && <p>Loading operations...</p>}
      {query.error && <p role="alert">Gateway request failed: {(query.error as Error).message}</p>}
      {query.data !== undefined && <pre>{JSON.stringify(query.data, null, 2)}</pre>}
    </section>
  );
}
