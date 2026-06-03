import mqtt, { type MqttClient } from 'mqtt';
import type { ServiceEnv } from './env.js';

export function createMqttClient(env: ServiceEnv): MqttClient {
  return mqtt.connect(env.MQTT_URL, {
    clientId: `${env.SERVICE_NAME}-${crypto.randomUUID()}`,
    reconnectPeriod: 2_000,
    clean: true
  });
}

export const MqttTopics = {
  riderLocation: (riderId: string) => `roundz/riders/${riderId}/location`,
  tripLocation: (tripId: string) => `roundz/trips/${tripId}/location`,
  riderCommands: (riderId: string) => `roundz/riders/${riderId}/commands`
};
