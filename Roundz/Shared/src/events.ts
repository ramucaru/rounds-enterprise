import type { Coordinates, Trip, UserRole } from './dto.js';

export type EventEnvelope<TType extends string, TPayload> = {
  id: string;
  type: TType;
  occurredAt: string;
  producer: string;
  payload: TPayload;
};

export type UserCreatedEvent = EventEnvelope<'user.created', {
  userId: string;
  email: string;
  role: UserRole;
}>;

export type RiderAvailabilityChangedEvent = EventEnvelope<'rider.availability.changed', {
  riderId: string;
  available: boolean;
  location?: Coordinates;
}>;

export type TripRequestedEvent = EventEnvelope<'trip.requested', {
  trip: Trip;
}>;

export type TripMatchedEvent = EventEnvelope<'trip.matched', {
  tripId: string;
  riderId: string;
  estimatedPickupMinutes: number;
}>;

export type LocationUpdatedEvent = EventEnvelope<'location.updated', {
  tripId?: string;
  riderId: string;
  location: Coordinates;
}>;

export type RoundzDomainEvent =
  | UserCreatedEvent
  | RiderAvailabilityChangedEvent
  | TripRequestedEvent
  | TripMatchedEvent
  | LocationUpdatedEvent;
