import { requireDb, startService } from '@roundz/common';

void startService({
  name: 'user-service',
  defaultPort: 3011,
  async registerRoutes(app, context) {
    app.get('/v1/users/:id', async (request, reply) => {
      const { id } = request.params as { id: string };
      const result = await requireDb(context).query('SELECT id, email, phone, full_name, role, status, created_at FROM users WHERE id = $1', [id]);
      if (!result.rows[0]) return reply.code(404).send({ message: 'User not found' });
      return result.rows[0];
    });

    app.patch('/v1/users/:id', async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as { fullName?: string; phone?: string; status?: string };
      const result = await requireDb(context).query(
        `UPDATE users SET full_name = COALESCE($2, full_name), phone = COALESCE($3, phone), status = COALESCE($4, status), updated_at = now()
         WHERE id = $1 RETURNING id, email, phone, full_name, role, status`,
        [id, body.fullName ?? null, body.phone ?? null, body.status ?? null]
      );
      if (!result.rows[0]) return reply.code(404).send({ message: 'User not found' });
      return result.rows[0];
    });
  }
});
