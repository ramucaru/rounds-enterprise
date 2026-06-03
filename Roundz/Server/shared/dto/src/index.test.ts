import { describe, expect, it } from 'vitest';
import { CreateTripSchema, RegisterUserSchema, TrackingPositionSchema } from './index.js';

describe('Roundz DTO schemas', () => {
  it('normalizes registration email and validates password strength', () => {
    const dto = RegisterUserSchema.parse({ email: 'RIDER@ROUNDZ.APP', fullName: 'Amina Rider', password: 'secure-pass' });
    expect(dto.email).toBe('rider@roundz.app');
  });

  it('rejects invalid geo coordinates', () => {
    expect(() => TrackingPositionSchema.parse({ tripId: crypto.randomUUID(), latitude: 99, longitude: 1 })).toThrow();
  });

  it('accepts valid trip creation requests', () => {
    const dto = CreateTripSchema.parse({
      customerId: crypto.randomUUID(),
      pickupAddress: 'Airport',
      pickupLatitude: 6.5244,
      pickupLongitude: 3.3792,
      dropoffAddress: 'Victoria Island',
      dropoffLatitude: 6.4281,
      dropoffLongitude: 3.4219,
      quotedFareCents: 2500
    });
    expect(dto.currency).toBe('USD');
  });
});
