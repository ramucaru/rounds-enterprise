# @roundz/dto

Shared Zod DTO schemas and TypeScript DTO types for the Roundz Fastify gateway and backend microservices.

## Public imports

Services can import everything from the package root:

```ts
import { TrackingPositionSchema } from '@roundz/dto';
```

Granular subpath imports are also exported after build:

```ts
import { TrackingPositionSchema } from '@roundz/dto/tracking';
import { CreateTripSchema } from '@roundz/dto/trips';
```

## DTO modules

- `common.ts` - shared ids, email, currency, pagination, errors, and coordinates.
- `auth.dto.ts` - registration, login, and auth token responses.
- `users.dto.ts` - user roles, statuses, profile updates, and user responses.
- `riders.dto.ts` - rider profile, vehicle, KYC, and online status DTOs.
- `trips.dto.ts` - trip creation, trip queries, status updates, and trip responses.
- `tracking.dto.ts` - live tracking position DTOs used by the gateway Socket.IO handler.
- `wallet.dto.ts` - wallet ledger and wallet response DTOs.
- `payment.dto.ts` - payment intent and payment response DTOs.
- `notification.dto.ts` - notification request and response DTOs.
- `kyc.dto.ts` - rider KYC document submission DTOs.
- `analytics.dto.ts` - admin analytics summary DTOs.

