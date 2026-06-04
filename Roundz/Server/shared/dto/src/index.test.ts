import { describe, expect, it } from 'vitest';
import {
  CreateRiderProfileSchema,
  CreateTripSchema,
  KycSubmissionSchema,
  LoginSchema,
  NotificationRequestSchema,
  PaymentIntentSchema,
  RegisterUserSchema,
  TrackingPositionSchema,
  UpdateTripStatusSchema,
  WalletLedgerEntrySchema
} from './index.js';

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

  it('exports auth, rider, trip, wallet, payment, notification and kyc schemas from the root barrel', () => {
    expect(LoginSchema.parse({ email: 'USER@ROUNDZ.APP', password: 'secret' }).email).toBe('user@roundz.app');
    expect(CreateRiderProfileSchema.parse({ userId: crypto.randomUUID() }).vehicleType).toBe('motorcycle');
    expect(UpdateTripStatusSchema.parse({ status: 'matched', riderId: crypto.randomUUID() }).status).toBe('matched');
    expect(WalletLedgerEntrySchema.parse({ userId: crypto.randomUUID(), amountCents: 1000, entryType: 'credit', reference: 'top-up' }).metadata).toEqual({});
    expect(PaymentIntentSchema.parse({ userId: crypto.randomUUID(), amountCents: 2500, provider: 'cash' }).currency).toBe('USD');
    expect(NotificationRequestSchema.parse({ channel: 'in_app', title: 'Trip update', body: 'Your rider arrived' }).metadata).toEqual({});
    expect(KycSubmissionSchema.parse({ riderId: crypto.randomUUID(), documentType: 'driver_license', documentBase64: 'YWJjZGVmZ2hpamtsbW5vcA==' }).contentType).toBe('application/octet-stream');
  });
});
