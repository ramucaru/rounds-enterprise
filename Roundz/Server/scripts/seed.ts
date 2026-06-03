import bcrypt from 'bcryptjs';
import { createDbPool, ensureSchema } from '../shared/common/src/index.js';

const databaseUrl = process.env.DATABASE_URL ?? 'postgres://roundz:roundz@localhost:5432/roundz';
const db = createDbPool(databaseUrl);
await ensureSchema(db);
const passwordHash = await bcrypt.hash('Password123!', 12);
await db.query(`INSERT INTO users (email, full_name, role, password_hash) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING`, ['admin@roundz.app', 'Roundz Admin', 'admin', passwordHash]);
await db.end();
