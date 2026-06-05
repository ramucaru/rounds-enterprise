import { useState } from 'react';
import { useRoundzAdminStore, useStoredWallet } from '@roundz/admin-shared';

export default function Module() {
  const selectedUserId = useRoundzAdminStore((state) => state.selectedWalletUserId ?? state.selectedUserId);
  const setSelectedIds = useRoundzAdminStore((state) => state.setSelectedIds);
  const [userId, setUserId] = useState(selectedUserId ?? '');
  const wallet = useStoredWallet();

  return (
    <section className="card">
      <h1>Wallet Management</h1>
      <p>Wallet requests use the persisted user id from User Management or this module.</p>
      <div className="module-controls">
        <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="User id for wallet lookup" />
        <button onClick={() => setSelectedIds({ selectedUserId: userId, selectedWalletUserId: userId })} disabled={!userId}>Store wallet user</button>
      </div>
      {!selectedUserId && <p className="empty-state">No wallet user selected.</p>}
      {wallet.isLoading && <p>Loading wallet...</p>}
      {wallet.error && <p role="alert">Wallet request failed: {(wallet.error as Error).message}</p>}
      {wallet.data !== undefined && <pre>{JSON.stringify(wallet.data, null, 2)}</pre>}
    </section>
  );
}
