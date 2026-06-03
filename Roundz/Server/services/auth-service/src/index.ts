import bcrypt from 'bcryptjs';
import { ROUNDZ_EVENT_TOPICS, loginSchema, registrationSchema, type PublicUser } from '@roundz/shared';
import { readServiceConfig, startService, type RouteInstaller } from '@roundz/server-common';

const routes: RouteInstaller = async (app, runtime) => {
  app.post('/auth/register', async (request, reply) => {
    const input = registrationSchema.parse(request.body);
    const passwordHash = await bcrypt.hash(input.password, 12);
    const result = await runtime.db.query(
      `INSERT INTO users (email, password_hash, name, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, phone, role, created_at`,
      [input.email.toLowerCase(), passwordHash, input.name, input.phone, input.role]
    );
    const user = toPublicUser(result.rows[0]);
    await runtime.db.query('INSERT INTO wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [user.id]);
    await runtime.events.publish(ROUNDZ_EVENT_TOPICS.userCreated, 'user.created', { userId: user.id, email: user.email, role: user.role });
    reply.code(201);
    return { user, token: (app as any).jwt.sign({ sub: user.id, role: user.role }) };
  });

  app.post('/auth/login', async (request, reply) => {
    const input = loginSchema.parse(request.body);
    const result = await runtime.db.query('SELECT * FROM users WHERE email = $1', [input.email.toLowerCase()]);
    const userRecord = result.rows[0];
    if (!userRecord || !(await bcrypt.compare(input.password, userRecord.password_hash))) {
      reply.code(401);
      return { error: 'Invalid email or password' };
    }
    const token = (app as any).jwt.sign({ sub: userRecord.id, role: userRecord.role });
    await runtime.redis.set(`session:${userRecord.id}`, token, 'EX', 60 * 60 * 24 * 7);
    return { user: toPublicUser(userRecord), token };
  });

  app.get('/auth/me', async (request, reply) => {
    const auth = request.headers.authorization?.replace('Bearer ', '');
    if (!auth) {
      reply.code(401);
      return { error: 'Missing bearer token' };
    }
    const payload = (app as any).jwt.verify(auth) as { sub: string };
    const result = await runtime.db.query('SELECT id, email, name, phone, role, created_at FROM users WHERE id = $1', [payload.sub]);
    if (!result.rows[0]) {
      reply.code(404);
      return { error: 'User not found' };
    }
    return { user: toPublicUser(result.rows[0]) };
  });
};

function toPublicUser(row: any): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    role: row.role,
    createdAt: new Date(row.created_at).toISOString()
  };
}

await startService(readServiceConfig('auth-service', 4101), routes);
