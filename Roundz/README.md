# Roundz Enterprise Monorepo

Roundz is an enterprise ride-hailing platform scaffolded as a production-oriented monorepo. It contains Fastify microservices, a React admin microfrontend shell, Flutter customer and rider applications, shared contracts, and infrastructure assets.

## Required root structure

```text
Roundz/
  Server/
  Admin/
  Customer/
  Rider/
  Infrastructure/
  Shared/
  Docs/
```

## Quick start

```bash
cd Roundz
npm install
npm run dev:infra
npm run build
npm run dev:server
```

The default API gateway runs on `http://localhost:8080` and proxies the service APIs under `/api/*`.

## Branch

This baseline was prepared on branch `cursor/development-base-1-5dc3`, using `development-base-1` as the requested project baseline identifier.
