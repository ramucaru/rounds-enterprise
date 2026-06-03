# Roundz Architecture

Roundz is an event-driven ride-hailing platform. The Fastify gateway fronts domain microservices. PostgreSQL stores transactional data, Redis handles cache and Socket.IO fanout, Kafka/Redpanda carries domain events, and MQTT transports low-latency rider telemetry. Admin uses React Module Federation. Customer and Rider are Flutter modular applications.
