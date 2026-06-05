import { useMemo } from 'react';
import { useOperations, useRoundzAdminStore } from '@roundz/admin-shared';

function collectRiderIds(payload: unknown): string[] {
  const ids = new Set<string>();
  const visit = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if ((key === 'rider_id' || key === 'riderId') && typeof child === 'string') ids.add(child);
      visit(child);
    }
  };
  visit(payload);
  return [...ids];
}

export default function Module() {
  const query = useOperations();
  const riderIds = useMemo(() => collectRiderIds(query.data), [query.data]);
  const selectedRiderId = useRoundzAdminStore((state) => state.selectedRiderId);
  const setSelectedIds = useRoundzAdminStore((state) => state.setSelectedIds);

  return (
    <section className="card">
      <h1>Rider Management</h1>
      <p>Rider ids are discovered from live operations/KYC/trip payloads and stored for cross-module use.</p>
      {riderIds.length === 0 && <p className="empty-state">No rider ids found in the latest operations payload.</p>}
      <div className="chip-row">{riderIds.map((id) => <button className="chip" key={id} onClick={() => setSelectedIds({ selectedRiderId: id })}>{id}</button>)}</div>
      <p>Selected rider: <strong>{selectedRiderId ?? 'none'}</strong></p>
      {query.isLoading && <p>Loading operations...</p>}
      {query.error && <p role="alert">Gateway request failed: {(query.error as Error).message}</p>}
      {query.data !== undefined && <pre>{JSON.stringify(query.data, null, 2)}</pre>}
    </section>
  );
}
