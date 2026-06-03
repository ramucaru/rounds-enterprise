import { createDomainEvent, EventTopics, requireDb, startService, uploadKycDocument } from '@roundz/common';
import { KycSubmissionSchema } from '@roundz/dto';

void startService({
  name: 'kyc-service',
  defaultPort: 3021,
  async registerRoutes(app, context) {
    app.post('/v1/kyc/submissions', async (request, reply) => {
      const dto = KycSubmissionSchema.parse(request.body);
      const key = `kyc/${dto.riderId}/${dto.documentType}/${crypto.randomUUID()}`;
      const buffer = Buffer.from(dto.documentBase64, 'base64');
      const s3Uri = await uploadKycDocument(context.env, key, buffer, dto.contentType);
      const result = await requireDb(context).query(
        'INSERT INTO kyc_submissions (rider_id, document_type, document_s3_key) VALUES ($1,$2,$3) RETURNING *',
        [dto.riderId, dto.documentType, s3Uri]
      );
      await context.bus.publish(createDomainEvent(EventTopics.KycSubmitted, result.rows[0].id, result.rows[0]));
      return reply.code(201).send(result.rows[0]);
    });
  }
});
