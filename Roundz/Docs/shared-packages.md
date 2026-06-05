# Shared package architecture

Backend shared packages live under `Server/shared/*` and are npm workspaces.

- `@roundz/config` - Zod environment validation, dotenv loading, service discovery, CORS, Kafka broker helpers, safe redaction.
- `@roundz/common` - Fastify service bootstrap, PostgreSQL, Redis, Kafka, MQTT, AWS, service helpers.
- `@roundz/dto` - request/response DTOs and Zod schemas for services and gateway.
- `@roundz/events` - event topics and event envelope schemas.
- `@roundz/logger` - structured logger factory.
- `@roundz/types` - shared interfaces/enums.
- `@roundz/utils` - reusable calculations and formatting helpers.

All packages build to ESM `dist/` and are consumed via workspace package resolution.
