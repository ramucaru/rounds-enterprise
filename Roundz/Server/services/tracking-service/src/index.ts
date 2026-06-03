import { Server } from 'socket.io';
import { z } from 'zod';
import { ROUNDZ_EVENT_TOPICS, coordinatesSchema } from '@roundz/shared';
import { readServiceConfig, startService, type RouteInstaller } from '@roundz/server-common';

const locationSchema = z.object({ riderId: z.string().uuid(), tripId: z.string().uuid().optional(), location: coordinatesSchema });

const routes: RouteInstaller = async (app, runtime) => {
  const io = new Server(app.server, { cors: { origin: '*' } });
  io.on('connection', (socket) => {
    socket.on('tracking:join', (tripId: string) => socket.join(`trip:${tripId}`));
  });

  app.post('/tracking/location', async (request) => {
    const input = locationSchema.parse(request.body);
    await runtime.db.query(
      'INSERT INTO tracking_points (trip_id, rider_id, lat, lng) VALUES ($1, $2, $3, $4)',
      [input.tripId, input.riderId, input.location.lat, input.location.lng]
    );
    await runtime.db.query('UPDATE rider_profiles SET current_lat = $2, current_lng = $3, updated_at = now() WHERE id = $1', [input.riderId, input.location.lat, input.location.lng]);
    await runtime.events.publish(ROUNDZ_EVENT_TOPICS.locationUpdated, 'location.updated', input);
    runtime.mqtt.publish(`roundz/tracking/${input.riderId}`, JSON.stringify(input));
    if (input.tripId) io.to(`trip:${input.tripId}`).emit('tracking:location', input);
    return { accepted: true };
  });

  app.get('/tracking/trips/:tripId', async (request) => {
    const { tripId } = request.params as { tripId: string };
    const result = await runtime.db.query('SELECT * FROM tracking_points WHERE trip_id = $1 ORDER BY recorded_at ASC', [tripId]);
    return { points: result.rows };
  });
};

await startService(readServiceConfig('tracking-service', 4106), routes);
