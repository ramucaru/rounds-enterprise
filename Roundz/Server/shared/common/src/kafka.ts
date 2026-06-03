import { Kafka, type Consumer, type EachMessagePayload, type Producer } from 'kafkajs';
import { kafkaBrokers, type ServiceEnv } from './env.js';
import type { DomainEvent, EventTopic } from './events.js';
import type { RoundzLogger } from './logger.js';

export interface EventBus {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  subscribe(topic: EventTopic, groupId: string, handler: (event: DomainEvent) => Promise<void>): Promise<Consumer>;
  disconnect(): Promise<void>;
}

export function createKafkaEventBus(env: ServiceEnv, logger: RoundzLogger): EventBus {
  const kafka = new Kafka({ clientId: env.SERVICE_NAME, brokers: kafkaBrokers(env) });
  const consumers: Consumer[] = [];
  let producer: Producer | undefined;
  let producerConnected = false;

  async function getProducer() {
    producer ??= kafka.producer({ allowAutoTopicCreation: true });
    if (!producerConnected) {
      await producer.connect();
      producerConnected = true;
    }
    return producer;
  }

  return {
    async publish(event) {
      const p = await getProducer();
      await p.send({
        topic: event.topic,
        messages: [{ key: event.aggregateId, value: JSON.stringify(event), headers: { eventId: event.id } }]
      });
      logger.info({ topic: event.topic, eventId: event.id }, 'domain event published');
    },
    async subscribe(topic, groupId, handler) {
      const consumer = kafka.consumer({ groupId });
      await consumer.connect();
      await consumer.subscribe({ topic, fromBeginning: false });
      await consumer.run({
        eachMessage: async ({ message }: EachMessagePayload) => {
          if (!message.value) return;
          await handler(JSON.parse(message.value.toString()) as DomainEvent);
        }
      });
      consumers.push(consumer);
      logger.info({ topic, groupId }, 'domain event subscription active');
      return consumer;
    },
    async disconnect() {
      await Promise.all(consumers.map((consumer) => consumer.disconnect()));
      if (producerConnected && producer) await producer.disconnect();
    }
  };
}
