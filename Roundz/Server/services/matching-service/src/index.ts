import { createDomainEvent, EventTopics, requireDb, startService } from '@roundz/common';

void startService({
  name: 'matching-service',
  defaultPort: 3014,
  async registerRoutes(app, context) {
    async function matchTrip(tripId: string) {
      const db = requireDb(context);
      const tripResult = await db.query('SELECT * FROM trips WHERE id = $1', [tripId]);
      const trip = tripResult.rows[0];
      if (!trip) throw new Error('Trip not found');
      const riderResult = await db.query(
        `SELECT id, user_id, vehicle_type, current_latitude, current_longitude
         FROM rider_profiles
         WHERE online_status = 'online' AND kyc_status = 'verified'
         ORDER BY updated_at DESC LIMIT 1`
      );
      const rider = riderResult.rows[0];
      if (!rider) return { matched: false, reason: 'No verified online riders available' };
      const updated = await db.query("UPDATE trips SET rider_id = $2, status = 'matched', updated_at = now() WHERE id = $1 RETURNING *", [tripId, rider.id]);
      await context.bus.publish(createDomainEvent(EventTopics.TripMatched, tripId, { trip: updated.rows[0], rider }));
      return { matched: true, trip: updated.rows[0], rider };
    }

    app.post('/v1/matching/dispatch/:tripId', async (request) => {
      const { tripId } = request.params as { tripId: string };
      return matchTrip(tripId);
    });

    void context.bus.subscribe(EventTopics.TripRequested, 'matching-service', async (event) => {
      await matchTrip(event.aggregateId);
    }).catch((error) => context.logger.error({ error }, 'matching subscription failed'));
  }
});
