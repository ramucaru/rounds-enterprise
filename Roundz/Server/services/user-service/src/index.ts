import { readServiceConfig, startService, type RouteInstaller } from '@roundz/server-common';

const routes: RouteInstaller = async (app, runtime) => {
  app.get('/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await runtime.db.query('SELECT id, email, name, phone, role, created_at FROM users WHERE id = $1', [id]);
    if (!result.rows[0]) {
      reply.code(404);
      return { error: 'User not found' };
    }
    return { user: result.rows[0] };
  });

  app.patch('/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { name?: string; phone?: string };
    const result = await runtime.db.query(
      `UPDATE users SET name = COALESCE($2, name), phone = COALESCE($3, phone), updated_at = now()
       WHERE id = $1 RETURNING id, email, name, phone, role, created_at`,
      [id, body.name, body.phone]
    );
    if (!result.rows[0]) {
      reply.code(404);
      return { error: 'User not found' };
    }
    return { user: result.rows[0] };
  });
};

await startService(readServiceConfig('user-service', 4102), routes);
