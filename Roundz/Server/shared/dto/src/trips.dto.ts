import { z } from 'zod';
import { CurrencyCodeSchema, UuidSchema } from './common.js';

export const TripStatusSchema = z.enum(['requested', 'matched', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled']);
export type TripStatusDto = z.infer<typeof TripStatusSchema>;

export const CreateTripSchema = z.object({
  customerId: UuidSchema,
  pickupAddress: z.string().min(2),
  pickupLatitude: z.number().min(-90).max(90),
  pickupLongitude: z.number().min(-180).max(180),
  dropoffAddress: z.string().min(2),
  dropoffLatitude: z.number().min(-90).max(90),
  dropoffLongitude: z.number().min(-180).max(180),
  quotedFareCents: z.number().int().positive(),
  currency: CurrencyCodeSchema.default('USD')
});
export type CreateTripDto = z.infer<typeof CreateTripSchema>;

export const UpdateTripStatusSchema = z.object({
  status: TripStatusSchema,
  riderId: UuidSchema.optional()
});
export type UpdateTripStatusDto = z.infer<typeof UpdateTripStatusSchema>;

export const TripQuerySchema = z.object({
  customerId: UuidSchema.optional(),
  riderId: UuidSchema.optional(),
  status: TripStatusSchema.optional()
});
export type TripQueryDto = z.infer<typeof TripQuerySchema>;

export const TripResponseSchema = z.object({
  id: UuidSchema,
  customerId: UuidSchema,
  riderId: UuidSchema.optional().nullable(),
  pickupAddress: z.string(),
  pickupLatitude: z.number(),
  pickupLongitude: z.number(),
  dropoffAddress: z.string(),
  dropoffLatitude: z.number(),
  dropoffLongitude: z.number(),
  status: TripStatusSchema,
  quotedFareCents: z.number().int(),
  currency: CurrencyCodeSchema
});
export type TripResponseDto = z.infer<typeof TripResponseSchema>;
