import { z } from 'zod';

const adminEnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('http://localhost:3000'),
  VITE_SOCKET_URL: z.string().url().default('http://localhost:3000'),
  VITE_AUTH_ENABLED: z.coerce.boolean().default(true),
  VITE_ENABLE_REALTIME: z.coerce.boolean().default(true),
  VITE_DEFAULT_LOCALE: z.string().default('en')
});

export type AdminEnv = z.infer<typeof adminEnvSchema>;

export function loadAdminEnv(env: Record<string, unknown> = (import.meta as unknown as { env?: Record<string, unknown> }).env ?? {}): AdminEnv {
  const parsed = adminEnvSchema.safeParse(env);
  if (!parsed.success) {
    throw new Error(`Invalid admin frontend environment: ${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
  }
  return parsed.data;
}

