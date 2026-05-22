locals {
  # Predicted modern Cloud Run v2 URL: https://<service>-<project-number>.<region>.run.app.
  # Older projects get a hash-based URL instead — set origin_override after the first apply if so.
  predicted_cloud_run_url = "https://${var.service_name}-${data.google_project.this.number}.${var.region}.run.app"
  cloud_run_url           = var.origin_override != "" ? var.origin_override : local.predicted_cloud_run_url
}
