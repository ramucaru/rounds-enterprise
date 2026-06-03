import assert from 'node:assert/strict';
import { readServiceConfig } from './config.js';

const config = readServiceConfig('test-service', 4999);
assert.equal(config.serviceName, 'test-service');
assert.ok(config.kafkaBrokers.length > 0);
