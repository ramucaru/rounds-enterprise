import { z } from 'zod';
import { UuidSchema } from './common.js';

export const KycDocumentTypeSchema = z.enum(['driver_license', 'national_id', 'vehicle_registration', 'insurance']);
export type KycDocumentTypeDto = z.infer<typeof KycDocumentTypeSchema>;

export const KycSubmissionSchema = z.object({
  riderId: UuidSchema,
  documentType: KycDocumentTypeSchema,
  documentBase64: z.string().min(16),
  contentType: z.string().default('application/octet-stream')
});
export type KycSubmissionDto = z.infer<typeof KycSubmissionSchema>;

export const KycSubmissionResponseSchema = z.object({
  id: UuidSchema,
  riderId: UuidSchema,
  documentType: KycDocumentTypeSchema,
  documentS3Key: z.string(),
  status: z.enum(['submitted', 'verified', 'rejected'])
});
export type KycSubmissionResponseDto = z.infer<typeof KycSubmissionResponseSchema>;
