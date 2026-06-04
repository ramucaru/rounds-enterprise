import { z } from 'zod';

export const CountByStatusSchema = z.object({
  status: z.string(),
  count: z.number().int().nonnegative()
});
export type CountByStatusDto = z.infer<typeof CountByStatusSchema>;

export const AnalyticsSummarySchema = z.object({
  users: z.array(z.object({ role: z.string(), count: z.number().int().nonnegative() })),
  trips: z.array(CountByStatusSchema),
  riders: z.array(z.object({ onlineStatus: z.string(), count: z.number().int().nonnegative() })).optional(),
  revenue: z.object({ capturedRevenueCents: z.number().int().nonnegative() }).optional()
});
export type AnalyticsSummaryDto = z.infer<typeof AnalyticsSummarySchema>;
