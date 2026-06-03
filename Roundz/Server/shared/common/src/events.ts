export const EventTopics = {
  UserRegistered: 'roundz.user.registered',
  RiderVerified: 'roundz.rider.verified',
  TripRequested: 'roundz.trip.requested',
  TripMatched: 'roundz.trip.matched',
  TripStatusChanged: 'roundz.trip.status.changed',
  TrackingPositionUpdated: 'roundz.tracking.position.updated',
  WalletLedgerPosted: 'roundz.wallet.ledger.posted',
  PaymentCaptured: 'roundz.payment.captured',
  NotificationRequested: 'roundz.notification.requested',
  KycSubmitted: 'roundz.kyc.submitted'
} as const;

export type EventTopic = (typeof EventTopics)[keyof typeof EventTopics];

export interface DomainEvent<TPayload = unknown> {
  id: string;
  topic: EventTopic;
  aggregateId: string;
  occurredAt: string;
  payload: TPayload;
  metadata?: Record<string, string>;
}

export function createDomainEvent<TPayload>(topic: EventTopic, aggregateId: string, payload: TPayload): DomainEvent<TPayload> {
  return {
    id: crypto.randomUUID(),
    topic,
    aggregateId,
    occurredAt: new Date().toISOString(),
    payload
  };
}
