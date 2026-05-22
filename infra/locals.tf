locals {
  # Modern Cloud Run v2 URL format: https://<service>-<project-number>.<region>.run.app
  cloud_run_url = "https://${var.service_name}-${data.google_project.this.number}.${var.region}.run.app"
}
