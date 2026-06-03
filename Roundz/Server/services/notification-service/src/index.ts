import { z } from 'zod';
import { notificationRequestSchema } from '@roundz/shared';
import { readServiceConfig, startService, type RouteInstaller } from '@roundz/server-common';

const tokenSchema = z.object({ userId: z.string().uuid(), token: z.string().min(1), platform: z.enum(['ios', 'android', 'web']), endpointArn: z.string().optional() });

const routes: RouteInstaller = async (app, runtime) => {
  app.post('/notifications/tokens', async (request, reply) => {
    const input = tokenSchema.parse(request.body);
    const result = await runtime.db.query(
      `INSERT INTO push_tokens (user_id, token, platform, endpoint_arn)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, token) DO UPDATE SET endpoint_arn = EXCLUDED.endpoint_arn
       RETURNING *`,
      [input.userId, input.token, input.platform, input.endpointArn]
    );
    reply.code(201);
    return { token: result.rows[0] };
  });

  app.post('/notifications/send', async (request, reply) => {
    const input = notificationRequestSchema.parse(request.body);
    const saved = await runtime.db.query(
      `INSERT INTO notifications (user_id, title, body, data, status)
       VALUES ($1, $2, $3, $4, 'queued') RETURNING *`,
      [input.userId, input.title, input.body, JSON.stringify(input.data ?? {})]
    );
    const tokens = await runtime.db.query('SELECT * FROM push_tokens WHERE user_id = $1 AND endpoint_arn IS NOT NULL', [input.userId]);
    await Promise.all(tokens.rows.map((token) => runtime.push.publish({ endpointArn: token.endpoint_arn, title: input.title, body: input.body, data: input.data })));
    await runtime.db.query('UPDATE notifications SET status = $2 WHERE id = $1', [saved.rows[0].id, 'sent']);
    reply.code(202);
    return { notification: { ...saved.rows[0], status: 'sent' } };
  });
};

await startService(readServiceConfig('notification-service', 4109), routes);
