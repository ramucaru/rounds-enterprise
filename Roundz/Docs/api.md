# Roundz API Surface

All services expose `/health`. Gateway routes are mounted below `/api/<service>`.

| Service | Base path | Key endpoints |
| --- | --- | --- |
| Auth | `/api/auth` | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Users | `/api/users` | `GET /users/:id`, `PATCH /users/:id` |
| Riders | `/api/riders` | `POST /riders`, `PATCH /riders/:id/availability`, `GET /riders/available` |
| Trips | `/api/trips` | `POST /trips`, `GET /trips/:id`, `PATCH /trips/:id/status` |
| Matching | `/api/matching` | `POST /matching/match` |
| Tracking | `/api/tracking` | `POST /tracking/location`, `GET /tracking/trips/:tripId` |
| Wallets | `/api/wallets` | `GET /wallets/users/:userId`, `POST /wallets/users/:userId/transactions` |
| Payments | `/api/payments` | `POST /payments/charge` |
| Notifications | `/api/notifications` | `POST /notifications/tokens`, `POST /notifications/send` |
| Analytics | `/api/analytics` | `GET /analytics/overview` |
| Admin | `/api/admin` | `GET /admin/dashboard` |
| KYC | `/api/kyc` | `POST /kyc/records`, `PATCH /kyc/records/:id/status` |
