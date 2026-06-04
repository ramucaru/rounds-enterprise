import { z } from 'zod';

export const UuidSchema = z.string().uuid();
export const EmailSchema = z.string().email().transform((value) => value.toLowerCase());
export const PhoneSchema = z.string().min(7).max(20);
export const CurrencyCodeSchema = z.string().length(3).transform((value) => value.toUpperCase());

export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});
export type CoordinatesDto = z.infer<typeof CoordinatesSchema>;

export const IdParamSchema = z.object({ id: UuidSchema });
export type IdParamDto = z.infer<typeof IdParamSchema>;

export const PaginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});
export type PaginationQueryDto = z.infer<typeof PaginationQuerySchema>;

export const ApiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional()
});
export type ApiErrorDto = z.infer<typeof ApiErrorSchema>;
