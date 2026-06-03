import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { DEFAULT_CURRENCY, ROUNDZ_EVENT_TOPICS } from '@roundz/shared';
import { readServiceConfig, startService, type RouteInstaller } from '@roundz/server-common';

const paymentSchema = z.object({ userId: z.string().uuid(), tripId: z.string().uuid().optional(), amountCents: z.number().int().positive(), paymentMethodId: z.string().min(1) });

const routes: RouteInstaller = async (app, runtime) => {
  app.post('/payments/charge', async (request, reply) => {
    const input = paymentSchema.parse(request.body);
    const providerReference = `roundz_${randomUUID()}`;
    const result = await runtime.db.query(
      `INSERT INTO payments (trip_id, user_id, amount_cents, currency, status, provider_reference)
       VALUES ($1, $2, $3, $4, 'completed', $5) RETURNING *`,
      [input.tripId, input.userId, input.amountCents, DEFAULT_CURRENCY, providerReference]
    );
    await runtime.events.publish(ROUNDZ_EVENT_TOPICS.paymentCompleted, 'payment.completed', { paymentId: result.rows[0].id, userId: input.userId, amountCents: input.amountCents });
    reply.code(201);
    return { payment: result.rows[0] };
  });
};

await startService(readServiceConfig('payment-service', 4108), routes);
