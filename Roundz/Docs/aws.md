# AWS Setup

Terraform provisions S3 for KYC documents, SNS for push notifications, and CloudWatch log groups/alarms. Runtime services use AWS SDK clients configured by `AWS_REGION`, optional `AWS_ENDPOINT_URL`, `AWS_S3_BUCKET`, and `AWS_SNS_PLATFORM_APPLICATION_ARN`.
