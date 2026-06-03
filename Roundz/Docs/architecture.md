# Roundz Architecture

Roundz is split into independently deployable systems under strict root folders:

- `Server`: Node.js Fastify microservices with PostgreSQL, Redis, Kafka, MQTT, Socket.IO, and AWS SNS integration.
- `Admin`: React microfrontend shell and independently deployable modules.
- `Customer`: Flutter modular customer app connected to the gateway.
- `Rider`: Flutter modular rider app connected to the gateway, tracking, MQTT, and push notifications.
- `Shared`: shared contracts, DTOs, schemas, event topics, and API clients.
- `Infrastructure`: Docker Compose, Kubernetes, Helm, Terraform, CI/CD, and monitoring assets.

## Runtime flow

1. Customer registers through `/api/auth/auth/register`.
2. Trip service creates a trip through `/api/trips/trips` and publishes `roundz.trip.requested`.
3. Matching service assigns an available rider and publishes `roundz.trip.matched`.
4. Tracking service accepts live GPS updates, stores them in PostgreSQL, emits Socket.IO updates, and publishes MQTT messages.
5. Payment and wallet services record money movement.
6. Notification service stores and sends push notifications through AWS SNS endpoints.
