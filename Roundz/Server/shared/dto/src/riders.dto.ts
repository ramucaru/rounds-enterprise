import { z } from 'zod';
import { UuidSchema } from './common.js';

export const VehicleTypeSchema = z.enum(['bicycle', 'motorcycle', 'car', 'van']);
export type VehicleTypeDto = z.infer<typeof VehicleTypeSchema>;

export const KycStatusSchema = z.enum(['pending', 'submitted', 'verified', 'rejected']);
export type KycStatusDto = z.infer<typeof KycStatusSchema>;

export const RiderOnlineStatusSchema = z.enum(['online', 'offline', 'busy']);
export type RiderOnlineStatusDto = z.infer<typeof RiderOnlineStatusSchema>;

export const CreateRiderProfileSchema = z.object({
  userId: UuidSchema,
  vehicleType: VehicleTypeSchema.default('motorcycle'),
  licenseNumber: z.string().min(3).optional()
});
export type CreateRiderProfileDto = z.infer<typeof CreateRiderProfileSchema>;

export const UpdateRiderStatusSchema = z.object({
  onlineStatus: RiderOnlineStatusSchema,
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});
export type UpdateRiderStatusDto = z.infer<typeof UpdateRiderStatusSchema>;

export const RiderProfileResponseSchema = z.object({
  id: UuidSchema,
  userId: UuidSchema,
  vehicleType: VehicleTypeSchema,
  licenseNumber: z.string().nullable().optional(),
  kycStatus: KycStatusSchema,
  onlineStatus: RiderOnlineStatusSchema,
  rating: z.number().min(0).max(5)
});
export type RiderProfileResponseDto = z.infer<typeof RiderProfileResponseSchema>;
