resource "aws_cloudwatch_metric_alarm" "gateway_5xx" {
  alarm_name          = "roundz-gateway-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "5XXError"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
}
