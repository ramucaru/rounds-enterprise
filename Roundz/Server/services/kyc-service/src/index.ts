import { z } from 'zod';
import { ROUNDZ_EVENT_TOPICS } from '@roundz/shared';
import { readServiceConfig, startService, type RouteInstaller } from '@roundz/server-common';

const kycSchema = z.object({ riderId: z.string().uuid(), documentType: z.string().min(1), documentUrl: z.string().url() });

const routes: RouteInstaller = async (app, runtime) => {
  app.post('/kyc/records', async (request, reply) => {
    const input = kycSchema.parse(request.body);
    const result = await runtime.db.query(
      'INSERT INTO kyc_records (rider_id, document_type, document_url) VALUES ($1, $2, $3) RETURNING *',
      [input.riderId, input.documentType, input.documentUrl]
    );
    await runtime.events.publish(ROUNDZ_EVENT_TOPICS.kycSubmitted, 'kyc.submitted', { riderId: input.riderId, recordId: result.rows[0].id });
    reply.code(201);
    return { record: result.rows[0] };
  });

  app.patch('/kyc/records/:id/status', async (request) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: 'approved' | 'rejected' | 'submitted' };
    const result = await runtime.db.query('UPDATE kyc_records SET status = $2, updated_at = now() WHERE id = $1 RETURNING *', [id, status]);
    return { record: result.rows[0] };
  });
};

await startService(readServiceConfig('kyc-service', 4112), routes);
