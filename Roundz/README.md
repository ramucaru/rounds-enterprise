# Roundz Enterprise Monorepo

This repository contains the generated Roundz enterprise architecture under the required `/Roundz` root:

- `Server` - Node.js Fastify TypeScript backend gateway and microservices.
- `Admin` - React TypeScript admin shell and Module Federation microfrontends.
- `Customer` - Flutter customer application with modular features.
- `Rider` - Flutter rider application with modular features.
- `Infrastructure` - Docker Compose, Kubernetes, Helm, Terraform, monitoring, and CI/CD assets.
- `Shared` - Cross-platform contracts, DTO schemas, events, API clients, and constants.
- `Docs` - Architecture, API, deployment, Kafka, and database documentation.

## Quick start

```bash
cd Roundz
cp .env.example .env
npm install
npm run dev:infra
npm run build
npm test
npm run dev:gateway
```

Start service processes in separate terminals, for example:

```bash
npm run dev -w @roundz/auth-service
npm run dev -w @roundz/trip-service
npm run dev -w @roundz/tracking-service
```

The backend is wired to PostgreSQL, Redis, Kafka/Redpanda, MQTT, Socket.IO, Firebase Cloud Messaging, and AWS SNS/S3 adapters. Local infrastructure is provided by `docker-compose.yml`.
