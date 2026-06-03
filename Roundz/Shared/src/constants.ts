export const ROUNDZ_EVENT_TOPICS = {
  userCreated: 'roundz.user.created',
  riderAvailabilityChanged: 'roundz.rider.availability.changed',
  tripRequested: 'roundz.trip.requested',
  tripMatched: 'roundz.trip.matched',
  tripStatusChanged: 'roundz.trip.status.changed',
  locationUpdated: 'roundz.location.updated',
  walletCredited: 'roundz.wallet.credited',
  paymentCompleted: 'roundz.payment.completed',
  notificationRequested: 'roundz.notification.requested',
  kycSubmitted: 'roundz.kyc.submitted'
} as const;

export const ROUNDZ_SERVICE_PORTS = {
  gateway: 8080,
  auth: 4101,
  user: 4102,
  rider: 4103,
  trip: 4104,
  matching: 4105,
  tracking: 4106,
  wallet: 4107,
  payment: 4108,
  notification: 4109,
  analytics: 4110,
  admin: 4111,
  kyc: 4112
} as const;

export const DEFAULT_CURRENCY = 'USD';
