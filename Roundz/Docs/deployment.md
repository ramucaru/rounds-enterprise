# Deployment

Local dependencies are started with Docker Compose:

```bash
cd Roundz
npm run dev:infra
```

Production deployments use the Kubernetes manifests and Helm values under `Infrastructure`. Terraform creates foundational AWS assets such as SNS and CloudWatch resources; extend it with account-specific VPC, EKS, RDS, ElastiCache, MSK, and IAM modules.
