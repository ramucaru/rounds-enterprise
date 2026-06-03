import { randomUUID } from 'node:crypto';
import { Kafka, type Consumer, type Producer } from 'kafkajs';
import type { EventEnvelope } from '@roundz/shared';

export class EventBus {
  private producer?: Producer;
  private consumers: Consumer[] = [];

  constructor(private readonly serviceName: string, private readonly brokers: string[]) {}

  async connect(): Promise<void> {
    const kafka = new Kafka({ clientId: this.serviceName, brokers: this.brokers });
    this.producer = kafka.producer();
    await this.producer.connect();
  }

  envelope<TType extends string, TPayload>(type: TType, payload: TPayload): EventEnvelope<TType, TPayload> {
    return {
      id: randomUUID(),
      type,
      occurredAt: new Date().toISOString(),
      producer: this.serviceName,
      payload
    };
  }

  async publish<TType extends string, TPayload>(topic: string, type: TType, payload: TPayload): Promise<void> {
    if (!this.producer) await this.connect();
    const event = this.envelope(type, payload);
    await this.producer!.send({
      topic,
      messages: [{ key: event.id, value: JSON.stringify(event) }]
    });
  }

  async subscribe(topic: string, groupId: string, handler: (event: EventEnvelope<string, unknown>) => Promise<void>): Promise<void> {
    const kafka = new Kafka({ clientId: this.serviceName, brokers: this.brokers });
    const consumer = kafka.consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        await handler(JSON.parse(message.value.toString()) as EventEnvelope<string, unknown>);
      }
    });
    this.consumers.push(consumer);
  }

  async disconnect(): Promise<void> {
    await Promise.all(this.consumers.map((consumer) => consumer.disconnect()));
    await this.producer?.disconnect();
  }
}
