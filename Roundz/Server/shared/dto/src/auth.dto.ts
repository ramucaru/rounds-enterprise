import { z } from 'zod';
import { EmailSchema, PhoneSchema } from './common.js';
import { UserRoleSchema, UserResponseSchema } from './users.dto.js';

export const RegisterUserSchema = z.object({
  email: EmailSchema,
  phone: PhoneSchema.optional(),
  fullName: z.string().min(2),
  password: z.string().min(8),
  role: UserRoleSchema.default('customer')
});
export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1)
});
export type LoginDto = z.infer<typeof LoginSchema>;

export const AuthTokenResponseSchema = z.object({
  token: z.string().min(1),
  user: UserResponseSchema
});
export type AuthTokenResponseDto = z.infer<typeof AuthTokenResponseSchema>;
