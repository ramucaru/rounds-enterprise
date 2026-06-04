import { z } from 'zod';
import { EmailSchema, PhoneSchema, UuidSchema } from './common.js';

export const UserRoleSchema = z.enum(['customer', 'rider', 'admin']);
export type UserRoleDto = z.infer<typeof UserRoleSchema>;

export const UserStatusSchema = z.enum(['active', 'suspended', 'deleted']);
export type UserStatusDto = z.infer<typeof UserStatusSchema>;

export const UserResponseSchema = z.object({
  id: UuidSchema,
  email: EmailSchema,
  phone: PhoneSchema.optional().nullable(),
  fullName: z.string().min(2),
  role: UserRoleSchema,
  status: UserStatusSchema.default('active')
});
export type UserResponseDto = z.infer<typeof UserResponseSchema>;

export const UpdateUserProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: PhoneSchema.optional(),
  status: UserStatusSchema.optional()
}).refine((value) => Object.keys(value).length > 0, { message: 'At least one profile field is required' });
export type UpdateUserProfileDto = z.infer<typeof UpdateUserProfileSchema>;
