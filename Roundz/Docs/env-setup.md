# Environment setup

Roundz uses `@roundz/config` for backend environment loading and validation. The package loads `.env` through `dotenv`, validates with Zod, and exposes typed helpers for PostgreSQL, Redis, Kafka, MQTT, AWS, JWT, logging, rate limiting, and service discovery.

## Backend env files

Each backend process has a colocated `.env` and `.env.example`:

- `Server/gateway/.env.example`
- `Server/services/auth-service/.env.example`
- `Server/services/user-service/.env.example`
- `Server/services/rider-service/.env.example`
- `Server/services/trip-service/.env.example`
- `Server/services/wallet-service/.env.example`
- `Server/services/payment-service/.env.example`
- `Server/services/notification-service/.env.example`
- `Server/services/analytics-service/.env.example`
- `Server/services/admin-service/.env.example`
- `Server/services/kyc-service/.env.example`

Set `DOTENV_CONFIG_PATH` when starting a service to load a service-specific file, for example:

```bash
DOTENV_CONFIG_PATH=Server/gateway/.env npm run dev:gateway
```

## Frontend env files

Admin Vite apps use `VITE_*` variables and validate runtime config through `@roundz/admin-shared`.

Flutter apps use `ROUNDZ_*` values for gateway, Socket.IO, MQTT, analytics, push, and role configuration.

## Environments

Use `APP_ENV=development|staging|production` and keep secrets outside source control for staging/production. Local `.env` files committed here contain development-only values and must not be reused in production.
