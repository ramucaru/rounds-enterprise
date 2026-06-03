import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { SNSClient, PublishCommand, CreatePlatformEndpointCommand } from '@aws-sdk/client-sns';
import { JWT } from 'google-auth-library';
import type { ServiceEnv } from './env.js';

function endpoint(env: ServiceEnv) {
  return env.AWS_ENDPOINT_URL ? { endpoint: env.AWS_ENDPOINT_URL, forcePathStyle: true } : {};
}

export function createS3Client(env: ServiceEnv): S3Client {
  return new S3Client({ region: env.AWS_REGION, ...endpoint(env) });
}

export function createSnsClient(env: ServiceEnv): SNSClient {
  return new SNSClient({ region: env.AWS_REGION, ...endpoint(env) });
}

export async function uploadKycDocument(env: ServiceEnv, key: string, body: Buffer | Uint8Array | string, contentType: string): Promise<string> {
  const s3 = createS3Client(env);
  await s3.send(new PutObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key, Body: body, ContentType: contentType }));
  return `s3://${env.AWS_S3_BUCKET}/${key}`;
}

export async function sendSnsPush(env: ServiceEnv, deviceToken: string, title: string, body: string): Promise<string> {
  if (!env.AWS_SNS_PLATFORM_APPLICATION_ARN) throw new Error('AWS_SNS_PLATFORM_APPLICATION_ARN is required for SNS push');
  const sns = createSnsClient(env);
  const endpointResult = await sns.send(new CreatePlatformEndpointCommand({
    PlatformApplicationArn: env.AWS_SNS_PLATFORM_APPLICATION_ARN,
    Token: deviceToken
  }));
  const publishResult = await sns.send(new PublishCommand({
    TargetArn: endpointResult.EndpointArn,
    MessageStructure: 'json',
    Message: JSON.stringify({ default: body, GCM: JSON.stringify({ notification: { title, body } }) })
  }));
  return publishResult.MessageId ?? '';
}

export async function sendFcmPush(env: ServiceEnv, deviceToken: string, title: string, body: string): Promise<string> {
  if (!env.FCM_PROJECT_ID || !env.FCM_CLIENT_EMAIL || !env.FCM_PRIVATE_KEY) {
    throw new Error('FCM_PROJECT_ID, FCM_CLIENT_EMAIL and FCM_PRIVATE_KEY are required for Firebase push');
  }
  const client = new JWT({
    email: env.FCM_CLIENT_EMAIL,
    key: env.FCM_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/firebase.messaging']
  });
  const { token } = await client.getAccessToken();
  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${env.FCM_PROJECT_ID}/messages:send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: { token: deviceToken, notification: { title, body } } })
  });
  if (!response.ok) throw new Error(`FCM push failed: ${response.status} ${await response.text()}`);
  const payload = await response.json() as { name?: string };
  return payload.name ?? '';
}
