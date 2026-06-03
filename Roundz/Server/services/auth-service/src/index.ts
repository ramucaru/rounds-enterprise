import bcrypt from 'bcryptjs';
import { createDomainEvent, EventTopics, queryOne, requireDb, startService } from '@roundz/common';
import { LoginSchema, RegisterUserSchema } from '@roundz/dto';

interface UserRow { id: string; email: string; full_name: string; role: string; password_hash: string; status: string; }

void startService({
  name: 'auth-service',
  defaultPort: 3010,
  async registerRoutes(app, context) {
    app.post('/v1/auth/register', async (request, reply) => {
      const db = requireDb(context);
      const dto = RegisterUserSchema.parse(request.body);
      const passwordHash = await bcrypt.hash(dto.password, 12);
      const user = await queryOne<UserRow>(db, `
        INSERT INTO users (email, phone, full_name, role, password_hash)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, full_name, role, password_hash, status
      `, [dto.email, dto.phone ?? null, dto.fullName, dto.role, passwordHash]);
      if (!user) throw new Error('User registration failed');
      await db.query('INSERT INTO wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [user.id]);
      await context.bus.publish(createDomainEvent(EventTopics.UserRegistered, user.id, { email: user.email, role: user.role }));
      const token = app.jwt.sign({ sub: user.id, role: user.role, email: user.email });
      return reply.code(201).send({ token, user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role, status: user.status } });
    });

    app.post('/v1/auth/login', async (request, reply) => {
      const db = requireDb(context);
      const dto = LoginSchema.parse(request.body);
      const user = await queryOne<UserRow>(db, 'SELECT id, email, full_name, role, password_hash, status FROM users WHERE email = $1', [dto.email]);
      if (!user || !(await bcrypt.compare(dto.password, user.password_hash))) {
        return reply.code(401).send({ message: 'Invalid email or password' });
      }
      const token = app.jwt.sign({ sub: user.id, role: user.role, email: user.email });
      return { token, user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role, status: user.status } };
    });
  }
});
