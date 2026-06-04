import { z } from 'zod';
import { UuidSchema } from './common.js';

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

export const TrackingPositionResponseSchema = TrackingPositionSchema.extend({
  id: UuidSchema,
  recordedAt: z.string().datetime()
});
export type TrackingPositionResponseDto = z.infer<typeof TrackingPositionResponseSchema>;
