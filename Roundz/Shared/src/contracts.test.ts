import assert from 'node:assert/strict';
import { registrationSchema, tripRequestSchema } from './schemas.js';

const registration = registrationSchema.parse({
  email: 'customer@example.com',
  password: 'super-secret',
  name: 'Roundz Customer',
  phone: '+15555550100',
  role: 'customer'
});
assert.equal(registration.role, 'customer');

const trip = tripRequestSchema.parse({
  customerId: '2f77f588-bc51-4c0c-8e2f-c3181aa6c3d1',
  pickup: { lat: 40.7128, lng: -74.006 },
  dropoff: { lat: 40.73061, lng: -73.935242 }
});
assert.equal(trip.pickup.lat, 40.7128);
