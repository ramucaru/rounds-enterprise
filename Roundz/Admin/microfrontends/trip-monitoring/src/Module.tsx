import { useMemo } from 'react';
import { useOperations, useRoundzAdminStore, useStoredTrackingPosition } from '@roundz/admin-shared';

function collectTrips(payload: unknown): Array<{ id: string; status?: string }> {
  const trips: Array<{ id: string; status?: string }> = [];
  const visit = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    const record = value as Record<string, unknown>;
    if (typeof record.id === 'string' && ('pickup_address' in record || 'pickupAddress' in record || 'quoted_fare_cents' in record)) trips.push({ id: record.id, status: String(record.status ?? '') });
    Object.values(record).forEach(visit);
  };
  visit(payload);
  return trips;
}

export default function Module() {
  const operations = useOperations();
  const position = useStoredTrackingPosition();
  const selectedTripId = useRoundzAdminStore((state) => state.selectedTripId);
  const setSelectedIds = useRoundzAdminStore((state) => state.setSelectedIds);
  const trips = useMemo(() => collectTrips(operations.data), [operations.data]);

  return (
    <section className="card">
      <h1>Trip Monitoring</h1>
      <p>Trips are loaded from the admin operations API. Selecting a trip persists its id and enables live tracking requests.</p>
      <div className="chip-row">{trips.map((trip) => <button className="chip" key={trip.id} onClick={() => setSelectedIds({ selectedTripId: trip.id })}>{trip.id} {trip.status && `(${trip.status})`}</button>)}</div>
      <p>Selected trip: <strong>{selectedTripId ?? 'none'}</strong></p>
      {position.data !== undefined && <><h2>Latest position</h2><pre>{JSON.stringify(position.data, null, 2)}</pre></>}
      {operations.isLoading && <p>Loading operations...</p>}
      {operations.error && <p role="alert">Gateway request failed: {(operations.error as Error).message}</p>}
      {operations.data !== undefined && <pre>{JSON.stringify(operations.data, null, 2)}</pre>}
    </section>
  );
}
