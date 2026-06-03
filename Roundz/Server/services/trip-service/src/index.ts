import { ROUNDZ_EVENT_TOPICS, tripRequestSchema } from '@roundz/shared';
import { readServiceConfig, startService, type RouteInstaller } from '@roundz/server-common';

const routes: RouteInstaller = async (app, runtime) => {
  app.post('/trips', async (request, reply) => {
    const input = tripRequestSchema.parse(request.body);
    const fareCents = estimateFareCents(input.pickup.lat, input.pickup.lng, input.dropoff.lat, input.dropoff.lng);
    const result = await runtime.db.query(
      `INSERT INTO trips (customer_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, status, fare_cents)
       VALUES ($1, $2, $3, $4, $5, 'requested', $6)
       RETURNING *`,
      [input.customerId, input.pickup.lat, input.pickup.lng, input.dropoff.lat, input.dropoff.lng, fareCents]
    );
    const trip = mapTrip(result.rows[0]);
    await runtime.events.publish(ROUNDZ_EVENT_TOPICS.tripRequested, 'trip.requested', { trip });
    reply.code(201);
    return { trip };
  });

  app.patch('/trips/:id/status', async (request) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: string };
    const result = await runtime.db.query('UPDATE trips SET status = $2, updated_at = now() WHERE id = $1 RETURNING *', [id, status]);
    await runtime.events.publish(ROUNDZ_EVENT_TOPICS.tripStatusChanged, 'trip.status.changed', { tripId: id, status });
    return { trip: mapTrip(result.rows[0]) };
  });

  app.get('/trips/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await runtime.db.query('SELECT * FROM trips WHERE id = $1', [id]);
    if (!result.rows[0]) {
      reply.code(404);
      return { error: 'Trip not found' };
    }
    return { trip: mapTrip(result.rows[0]) };
  });
};

function estimateFareCents(pickupLat: number, pickupLng: number, dropoffLat: number, dropoffLng: number): number {
  const distance = Math.hypot(pickupLat - dropoffLat, pickupLng - dropoffLng) * 111;
  return Math.max(500, Math.round((250 + distance * 175) * 100) / 100);
}

function mapTrip(row: any) {
  return {
    id: row.id,
    customerId: row.customer_id,
    riderId: row.rider_id ?? undefined,
    pickup: { lat: row.pickup_lat, lng: row.pickup_lng },
    dropoff: { lat: row.dropoff_lat, lng: row.dropoff_lng },
    status: row.status,
    fareCents: row.fare_cents,
    createdAt: new Date(row.created_at).toISOString()
  };
}

await startService(readServiceConfig('trip-service', 4104), routes);
