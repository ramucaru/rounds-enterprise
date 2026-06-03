import { describe, expect, it } from 'vitest';
import { createDomainEvent, EventTopics } from './events.js';
import { loadServiceEnv } from './env.js';

describe('common service primitives', () => {
  it('loads a typed environment', () => {
    const env = loadServiceEnv({ JWT_SECRET: 'test-secret-value', PORT: '3999' });
    expect(env.PORT).toBe(3999);
    expect(env.JWT_SECRET).toBe('test-secret-value');
  });

  it('creates domain events with ids and timestamps', () => {
    const event = createDomainEvent(EventTopics.TripRequested, 'trip-1', { customerId: 'user-1' });
    expect(event.topic).toBe(EventTopics.TripRequested);
    expect(event.id).toHaveLength(36);
    expect(event.occurredAt).toContain('T');
  });
});
