import { createDomainEvent, createMqttClient, EventTopics, MqttTopics, requireDb, startService } from '@roundz/common';
import { TrackingPositionSchema } from '@roundz/dto';

void startService({
  name: 'tracking-service',
  defaultPort: 3015,
  async registerRoutes(app, context) {
    const mqtt = createMqttClient(context.env);
    mqtt.on('connect', () => context.logger.info('tracking MQTT client connected'));

    app.post('/v1/tracking/positions', async (request, reply) => {
      const dto = TrackingPositionSchema.parse(request.body);
      const result = await requireDb(context).query(
        `INSERT INTO tracking_positions (trip_id, rider_id, latitude, longitude, heading, speed_mps, recorded_at)
         VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7, now())) RETURNING *`,
        [dto.tripId, dto.riderId ?? null, dto.latitude, dto.longitude, dto.heading ?? null, dto.speedMps ?? null, dto.recordedAt ?? null]
      );
      const position = result.rows[0];
      await context.bus.publish(createDomainEvent(EventTopics.TrackingPositionUpdated, dto.tripId, position));
      mqtt.publish(MqttTopics.tripLocation(dto.tripId), JSON.stringify(position), { qos: 1 });
      return reply.code(201).send(position);
    });

    app.get('/v1/tracking/trips/:tripId/latest', async (request, reply) => {
      const { tripId } = request.params as { tripId: string };
      const result = await requireDb(context).query('SELECT * FROM tracking_positions WHERE trip_id = $1 ORDER BY recorded_at DESC LIMIT 1', [tripId]);
      if (!result.rows[0]) return reply.code(404).send({ message: 'No tracking position found' });
      return result.rows[0];
    });

    app.addHook('onClose', async () => mqtt.endAsync());
  }
});
