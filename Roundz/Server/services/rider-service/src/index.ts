import { z } from 'zod';
import { ROUNDZ_EVENT_TOPICS, coordinatesSchema } from '@roundz/shared';
import { readServiceConfig, startService, type RouteInstaller } from '@roundz/server-common';

const onboardSchema = z.object({ userId: z.string().uuid(), vehicleType: z.string().min(1), vehiclePlate: z.string().min(1) });
const availabilitySchema = z.object({ available: z.boolean(), location: coordinatesSchema.optional() });

const routes: RouteInstaller = async (app, runtime) => {
  app.post('/riders', async (request, reply) => {
    const input = onboardSchema.parse(request.body);
    const result = await runtime.db.query(
      `INSERT INTO rider_profiles (user_id, vehicle_type, vehicle_plate)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.userId, input.vehicleType, input.vehiclePlate]
    );
    reply.code(201);
    return { rider: result.rows[0] };
  });

  app.patch('/riders/:id/availability', async (request) => {
    const { id } = request.params as { id: string };
    const input = availabilitySchema.parse(request.body);
    const result = await runtime.db.query(
      `UPDATE rider_profiles
       SET available = $2, current_lat = COALESCE($3, current_lat), current_lng = COALESCE($4, current_lng), updated_at = now()
       WHERE id = $1 RETURNING *`,
      [id, input.available, input.location?.lat, input.location?.lng]
    );
    await runtime.events.publish(ROUNDZ_EVENT_TOPICS.riderAvailabilityChanged, 'rider.availability.changed', { riderId: id, available: input.available, location: input.location });
    return { rider: result.rows[0] };
  });

  app.get('/riders/available', async () => {
    const result = await runtime.db.query('SELECT * FROM rider_profiles WHERE available = true ORDER BY rating DESC LIMIT 50');
    return { riders: result.rows };
  });
};

await startService(readServiceConfig('rider-service', 4103), routes);
