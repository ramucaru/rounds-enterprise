import { ROUNDZ_EVENT_TOPICS, coordinatesSchema } from '@roundz/shared';
import { readServiceConfig, startService, type RouteInstaller } from '@roundz/server-common';
import { z } from 'zod';

const matchSchema = z.object({ tripId: z.string().uuid(), pickup: coordinatesSchema });

const routes: RouteInstaller = async (app, runtime) => {
  app.post('/matching/match', async (request, reply) => {
    const input = matchSchema.parse(request.body);
    const rider = await findNearestAvailableRider(runtime.db, input.pickup.lat, input.pickup.lng);
    if (!rider) {
      reply.code(404);
      return { error: 'No available riders nearby' };
    }
    await runtime.db.query('UPDATE trips SET rider_id = $2, status = $3, updated_at = now() WHERE id = $1', [input.tripId, rider.id, 'matched']);
    await runtime.db.query('UPDATE rider_profiles SET available = false, updated_at = now() WHERE id = $1', [rider.id]);
    await runtime.events.publish(ROUNDZ_EVENT_TOPICS.tripMatched, 'trip.matched', { tripId: input.tripId, riderId: rider.id, estimatedPickupMinutes: 5 });
    return { match: { tripId: input.tripId, riderId: rider.id, estimatedPickupMinutes: 5 } };
  });
};

async function findNearestAvailableRider(db: any, lat: number, lng: number) {
  const result = await db.query(
    `SELECT *, ((current_lat - $1) * (current_lat - $1) + (current_lng - $2) * (current_lng - $2)) AS distance
     FROM rider_profiles
     WHERE available = true AND current_lat IS NOT NULL AND current_lng IS NOT NULL
     ORDER BY distance ASC, rating DESC
     LIMIT 1`,
    [lat, lng]
  );
  return result.rows[0];
}

await startService(readServiceConfig('matching-service', 4105), routes);
