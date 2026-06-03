import { createDomainEvent, EventTopics, requireDb, sendFcmPush, sendSnsPush, startService } from '@roundz/common';
import { NotificationRequestSchema } from '@roundz/dto';

void startService({
  name: 'notification-service',
  defaultPort: 3018,
  async registerRoutes(app, context) {
    app.post('/v1/notifications', async (request, reply) => {
      const dto = NotificationRequestSchema.parse(request.body);
      let providerMessageId: string | null = null;
      if (dto.channel === 'push' && dto.deviceToken) {
        providerMessageId = context.env.FCM_PROJECT_ID
          ? await sendFcmPush(context.env, dto.deviceToken, dto.title, dto.body)
          : await sendSnsPush(context.env, dto.deviceToken, dto.title, dto.body);
      }
      const result = await requireDb(context).query(
        `INSERT INTO notifications (user_id, channel, title, body, provider_message_id, status, metadata, delivered_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [dto.userId ?? null, dto.channel, dto.title, dto.body, providerMessageId, providerMessageId ? 'delivered' : 'queued', dto.metadata, providerMessageId ? new Date() : null]
      );
      await context.bus.publish(createDomainEvent(EventTopics.NotificationRequested, result.rows[0].id, result.rows[0]));
      return reply.code(201).send(result.rows[0]);
    });
  }
});
