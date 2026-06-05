import { z } from 'zod';

export const RoundzEventTopicSchema = z.enum([
  'roundz.user.registered',
  'roundz.rider.verified',
  'roundz.trip.requested',
  'roundz.trip.matched',
  'roundz.trip.status.changed',
  'roundz.tracking.position.updated',
  'roundz.wallet.ledger.posted',
  'roundz.payment.captured',
  'roundz.notification.requested',
  'roundz.kyc.submitted'
]);
export type RoundzEventTopic = z.infer<typeof RoundzEventTopicSchema>;

export const RoundzEventEnvelopeSchema = z.object({
  id: z.string().uuid(),
  topic: RoundzEventTopicSchema,
  aggregateId: z.string().min(1),
  occurredAt: z.string().datetime(),
  payload: z.unknown(),
  metadata: z.record(z.string(), z.string()).optional()
});
export type RoundzEventEnvelope = z.infer<typeof RoundzEventEnvelopeSchema>;

export function createEventEnvelope(topic: RoundzEventTopic, aggregateId: string, payload: unknown): RoundzEventEnvelope {
  return { id: crypto.randomUUID(), topic, aggregateId, occurredAt: new Date().toISOString(), payload };
}
