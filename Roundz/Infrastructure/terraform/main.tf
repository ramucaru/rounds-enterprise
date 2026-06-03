terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "kyc_documents" {
  bucket = var.kyc_bucket_name
}

resource "aws_sns_topic" "notifications" {
  name = "roundz-notifications"
}

resource "aws_cloudwatch_log_group" "services" {
  name              = "/roundz/services"
  retention_in_days = 30
}
