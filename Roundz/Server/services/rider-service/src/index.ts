import { createDomainEvent, EventTopics, requireDb, startService } from '@roundz/common';

void startService({
  name: 'rider-service',
  defaultPort: 3012,
  async registerRoutes(app, context) {
    app.post('/v1/riders', async (request, reply) => {
      const body = request.body as { userId: string; vehicleType?: string; licenseNumber?: string };
      const result = await requireDb(context).query(
        `INSERT INTO rider_profiles (user_id, vehicle_type, license_number) VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO UPDATE SET vehicle_type = EXCLUDED.vehicle_type, license_number = EXCLUDED.license_number, updated_at = now()
         RETURNING *`,
        [body.userId, body.vehicleType ?? 'motorcycle', body.licenseNumber ?? null]
      );
      return reply.code(201).send(result.rows[0]);
    });

    app.patch('/v1/riders/:id/status', async (request) => {
      const { id } = request.params as { id: string };
      const body = request.body as { onlineStatus: 'online' | 'offline' | 'busy'; latitude?: number; longitude?: number };
      const result = await requireDb(context).query(
        `UPDATE rider_profiles SET online_status = $2, current_latitude = COALESCE($3, current_latitude), current_longitude = COALESCE($4, current_longitude), updated_at = now()
         WHERE id = $1 RETURNING *`,
        [id, body.onlineStatus, body.latitude ?? null, body.longitude ?? null]
      );
      return result.rows[0];
    });

    app.post('/v1/riders/:id/verify', async (request) => {
      const { id } = request.params as { id: string };
      const result = await requireDb(context).query("UPDATE rider_profiles SET kyc_status = 'verified', updated_at = now() WHERE id = $1 RETURNING *", [id]);
      await context.bus.publish(createDomainEvent(EventTopics.RiderVerified, id, result.rows[0]));
      return result.rows[0];
    });
  }
});
