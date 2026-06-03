import { z } from 'zod';

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

export const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  phone: z.string().min(6),
  role: z.enum(['customer', 'rider', 'admin'])
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const tripRequestSchema = z.object({
  customerId: z.string().uuid(),
  pickup: coordinatesSchema,
  dropoff: coordinatesSchema,
  paymentMethodId: z.string().optional()
});

export const notificationRequestSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1),
  body: z.string().min(1),
  data: z.record(z.string(), z.string()).optional()
});
