import { useMemo, useState } from 'react';
import { useOperations, useRoundzAdminStore, useStoredUser } from '@roundz/admin-shared';

function collectIds(payload: unknown): string[] {
  const ids = new Set<string>();
  const visit = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if ((key === 'user_id' || key === 'userId' || key === 'customer_id' || key === 'customerId') && typeof child === 'string') ids.add(child);
      visit(child);
    }
  };
  visit(payload);
  return [...ids];
}

export default function Module() {
  const operations = useOperations();
  const user = useStoredUser();
  const selectedUserId = useRoundzAdminStore((state) => state.selectedUserId);
  const setSelectedIds = useRoundzAdminStore((state) => state.setSelectedIds);
  const [manualUserId, setManualUserId] = useState(selectedUserId ?? '');
  const userIds = useMemo(() => collectIds(operations.data), [operations.data]);

  return (
    <section className="card">
      <h1>User Management</h1>
      <p>Select a user from live operations data or enter a user id. The selection is persisted and shared with wallet, notifications, and support modules.</p>
      <div className="module-controls">
        <input value={manualUserId} onChange={(event) => setManualUserId(event.target.value)} placeholder="Paste user id from API data" />
        <button onClick={() => setSelectedIds({ selectedUserId: manualUserId, selectedWalletUserId: manualUserId })} disabled={!manualUserId}>Store user id</button>
      </div>
      {userIds.length > 0 && <div className="chip-row">{userIds.map((id) => <button className="chip" key={id} onClick={() => { setManualUserId(id); setSelectedIds({ selectedUserId: id, selectedWalletUserId: id }); }}>{id}</button>)}</div>}
      {!selectedUserId && <p className="empty-state">No user selected yet. Load operations or paste an id to fetch a profile.</p>}
      {user.isLoading && <p>Loading selected user...</p>}
      {user.error && <p role="alert">User request failed: {(user.error as Error).message}</p>}
      {user.data !== undefined && <pre>{JSON.stringify(user.data, null, 2)}</pre>}
    </section>
  );
}
