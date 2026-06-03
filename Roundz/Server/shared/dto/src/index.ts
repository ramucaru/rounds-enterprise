import { z } from 'zod';

export const EmailSchema = z.string().email().transform((value) => value.toLowerCase());
export const UuidSchema = z.string().uuid();

export const RegisterUserSchema = z.object({
  email: EmailSchema,
  phone: z.string().min(7).optional(),
  fullName: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(['customer', 'rider', 'admin']).default('customer')
});
export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1)
});
export type LoginDto = z.infer<typeof LoginSchema>;

export const CreateTripSchema = z.object({
  customerId: UuidSchema,
  pickupAddress: z.string().min(2),
  pickupLatitude: z.number().min(-90).max(90),
  pickupLongitude: z.number().min(-180).max(180),
  dropoffAddress: z.string().min(2),
  dropoffLatitude: z.number().min(-90).max(90),
  dropoffLongitude: z.number().min(-180).max(180),
  quotedFareCents: z.number().int().positive(),
  currency: z.string().length(3).default('USD')
});
export type CreateTripDto = z.infer<typeof CreateTripSchema>;

export const UpdateTripStatusSchema = z.object({
  status: z.enum(['requested', 'matched', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled']),
  riderId: UuidSchema.optional()
});
export type UpdateTripStatusDto = z.infer<typeof UpdateTripStatusSchema>;

export const TrackingPositionSchema = z.object({
  tripId: UuidSchema,
  riderId: UuidSchema.optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  heading: z.number().min(0).max(360).optional(),
  speedMps: z.number().nonnegative().optional(),
  recordedAt: z.string().datetime().optional()
});
export type TrackingPositionDto = z.infer<typeof TrackingPositionSchema>;

export const WalletLedgerEntrySchema = z.object({
  userId: UuidSchema,
  amountCents: z.number().int().positive(),
  entryType: z.enum(['credit', 'debit']),
  reference: z.string().min(2),
  metadata: z.record(z.string(), z.unknown()).default({})
});
export type WalletLedgerEntryDto = z.infer<typeof WalletLedgerEntrySchema>;

export const PaymentIntentSchema = z.object({
  userId: UuidSchema,
  tripId: UuidSchema.optional(),
  amountCents: z.number().int().positive(),
  currency: z.string().length(3).default('USD'),
  provider: z.enum(['stripe', 'mobile_money', 'cash'])
});
export type PaymentIntentDto = z.infer<typeof PaymentIntentSchema>;

export const NotificationRequestSchema = z.object({
  userId: UuidSchema.optional(),
  channel: z.enum(['push', 'sms', 'email', 'in_app']),
  title: z.string().min(1),
  body: z.string().min(1),
  deviceToken: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).default({})
});
export type NotificationRequestDto = z.infer<typeof NotificationRequestSchema>;

export const KycSubmissionSchema = z.object({
  riderId: UuidSchema,
  documentType: z.enum(['driver_license', 'national_id', 'vehicle_registration', 'insurance']),
  documentBase64: z.string().min(16),
  contentType: z.string().default('application/octet-stream')
});
export type KycSubmissionDto = z.infer<typeof KycSubmissionSchema>;
