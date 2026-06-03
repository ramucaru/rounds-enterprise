import { createDomainEvent, EventTopics, requireDb, startService } from '@roundz/common';
import { PaymentIntentSchema } from '@roundz/dto';

void startService({
  name: 'payment-service',
  defaultPort: 3017,
  async registerRoutes(app, context) {
    app.post('/v1/payments/intents', async (request, reply) => {
      const dto = PaymentIntentSchema.parse(request.body);
      const providerReference = `${dto.provider}_${crypto.randomUUID()}`;
      const result = await requireDb(context).query(
        `INSERT INTO payments (trip_id, user_id, amount_cents, currency, provider, provider_reference, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [dto.tripId ?? null, dto.userId, dto.amountCents, dto.currency, dto.provider, providerReference, dto.provider === 'cash' ? 'pending_cash_collection' : 'requires_capture']
      );
      return reply.code(201).send(result.rows[0]);
    });

    app.post('/v1/payments/:id/capture', async (request) => {
      const { id } = request.params as { id: string };
      const result = await requireDb(context).query("UPDATE payments SET status = 'captured', updated_at = now() WHERE id = $1 RETURNING *", [id]);
      const payment = result.rows[0];
      await context.bus.publish(createDomainEvent(EventTopics.PaymentCaptured, id, payment));
      return payment;
    });
  }
});
