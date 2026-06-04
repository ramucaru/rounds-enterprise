import { z } from 'zod';
import { CurrencyCodeSchema, UuidSchema } from './common.js';

export const WalletLedgerEntryTypeSchema = z.enum(['credit', 'debit']);
export type WalletLedgerEntryTypeDto = z.infer<typeof WalletLedgerEntryTypeSchema>;

export const WalletLedgerEntrySchema = z.object({
  userId: UuidSchema,
  amountCents: z.number().int().positive(),
  entryType: WalletLedgerEntryTypeSchema,
  reference: z.string().min(2),
  metadata: z.record(z.string(), z.unknown()).default({})
});
export type WalletLedgerEntryDto = z.infer<typeof WalletLedgerEntrySchema>;

export const WalletResponseSchema = z.object({
  id: UuidSchema,
  userId: UuidSchema,
  currency: CurrencyCodeSchema,
  balanceCents: z.number().int()
});
export type WalletResponseDto = z.infer<typeof WalletResponseSchema>;
