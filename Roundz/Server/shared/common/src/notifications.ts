import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

export type PushMessage = {
  endpointArn: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

export class PushNotificationClient {
  private readonly sns: SNSClient;

  constructor(region: string) {
    this.sns = new SNSClient({ region });
  }

  async publish(message: PushMessage): Promise<void> {
    await this.sns.send(new PublishCommand({
      TargetArn: message.endpointArn,
      MessageStructure: 'json',
      Message: JSON.stringify({
        default: `${message.title}: ${message.body}`,
        GCM: JSON.stringify({ notification: { title: message.title, body: message.body }, data: message.data ?? {} }),
        APNS: JSON.stringify({ aps: { alert: { title: message.title, body: message.body } }, data: message.data ?? {} })
      })
    }));
  }
}
