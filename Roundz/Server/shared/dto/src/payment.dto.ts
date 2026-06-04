import { z } from 'zod';
import { CurrencyCodeSchema, UuidSchema } from './common.js';

export const PaymentProviderSchema = z.enum(['stripe', 'mobile_money', 'cash']);
export type PaymentProviderDto = z.infer<typeof PaymentProviderSchema>;

export const PaymentStatusSchema = z.enum(['requires_action', 'requires_capture', 'pending_cash_collection', 'captured', 'failed', 'cancelled']);
export type PaymentStatusDto = z.infer<typeof PaymentStatusSchema>;

export const PaymentIntentSchema = z.object({
  userId: UuidSchema,
  tripId: UuidSchema.optional(),
  amountCents: z.number().int().positive(),
  currency: CurrencyCodeSchema.default('USD'),
  provider: PaymentProviderSchema
});
export type PaymentIntentDto = z.infer<typeof PaymentIntentSchema>;

export const PaymentResponseSchema = PaymentIntentSchema.extend({
  id: UuidSchema,
  providerReference: z.string().optional().nullable(),
  status: PaymentStatusSchema
});
export type PaymentResponseDto = z.infer<typeof PaymentResponseSchema>;
