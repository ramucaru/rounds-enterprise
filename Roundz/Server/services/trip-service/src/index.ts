import { createDomainEvent, EventTopics, requireDb, startService } from '@roundz/common';
import { CreateTripSchema, UpdateTripStatusSchema } from '@roundz/dto';

void startService({
  name: 'trip-service',
  defaultPort: 3013,
  async registerRoutes(app, context) {
    app.post('/v1/trips', async (request, reply) => {
      const dto = CreateTripSchema.parse(request.body);
      const result = await requireDb(context).query(
        `INSERT INTO trips (customer_id, pickup_address, pickup_latitude, pickup_longitude, dropoff_address, dropoff_latitude, dropoff_longitude, quoted_fare_cents, currency)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [dto.customerId, dto.pickupAddress, dto.pickupLatitude, dto.pickupLongitude, dto.dropoffAddress, dto.dropoffLatitude, dto.dropoffLongitude, dto.quotedFareCents, dto.currency]
      );
      const trip = result.rows[0];
      await context.bus.publish(createDomainEvent(EventTopics.TripRequested, trip.id, trip));
      return reply.code(201).send(trip);
    });

    app.get('/v1/trips', async (request) => {
      const query = request.query as { customerId?: string; riderId?: string; status?: string };
      const result = await requireDb(context).query(
        `SELECT * FROM trips
         WHERE ($1::uuid IS NULL OR customer_id = $1::uuid)
           AND ($2::uuid IS NULL OR rider_id = $2::uuid)
           AND ($3::text IS NULL OR status = $3)
         ORDER BY requested_at DESC LIMIT 100`,
        [query.customerId ?? null, query.riderId ?? null, query.status ?? null]
      );
      return result.rows;
    });

    app.patch('/v1/trips/:id/status', async (request) => {
      const { id } = request.params as { id: string };
      const dto = UpdateTripStatusSchema.parse(request.body);
      const result = await requireDb(context).query(
        `UPDATE trips SET status = $2, rider_id = COALESCE($3, rider_id), updated_at = now() WHERE id = $1 RETURNING *`,
        [id, dto.status, dto.riderId ?? null]
      );
      const trip = result.rows[0];
      await context.bus.publish(createDomainEvent(EventTopics.TripStatusChanged, id, trip));
      return trip;
    });
  }
});
