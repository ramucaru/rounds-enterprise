import { z } from 'zod';
import { UuidSchema } from './common.js';

export const NotificationChannelSchema = z.enum(['push', 'sms', 'email', 'in_app']);
export type NotificationChannelDto = z.infer<typeof NotificationChannelSchema>;

export const NotificationRequestSchema = z.object({
  userId: UuidSchema.optional(),
  channel: NotificationChannelSchema,
  title: z.string().min(1),
  body: z.string().min(1),
  deviceToken: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).default({})
});
export type NotificationRequestDto = z.infer<typeof NotificationRequestSchema>;

export const NotificationResponseSchema = NotificationRequestSchema.extend({
  id: UuidSchema,
  providerMessageId: z.string().optional().nullable(),
  status: z.enum(['pending', 'queued', 'delivered', 'failed'])
});
export type NotificationResponseDto = z.infer<typeof NotificationResponseSchema>;
