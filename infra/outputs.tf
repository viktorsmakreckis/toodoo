output "cloud_run_url" {
  description = "Public URL of the Cloud Run service."
  value       = google_cloud_run_v2_service.app.uri
}

output "predicted_cloud_run_url" {
  description = "URL passed to the app as ORIGIN. Must equal cloud_run_url after the first deploy."
  value       = local.cloud_run_url
}

output "cloud_run_service_name" {
  value = google_cloud_run_v2_service.app.name
}

output "artifact_registry_repository" {
  description = "Repository ID to push images to."
  value       = google_artifact_registry_repository.app.repository_id
}

output "artifact_registry_host" {
  description = "Hostname for `docker login` / `gcloud auth configure-docker`."
  value       = "${var.region}-docker.pkg.dev"
}

output "cloud_sql_instance_connection_name" {
  description = "Used by the Cloud SQL Auth Proxy for migration jobs."
  value       = google_sql_database_instance.main.connection_name
}

output "runtime_service_account_email" {
  value = google_service_account.runtime.email
}

output "deployer_service_account_email" {
  description = "Set this as the WIF_SERVICE_ACCOUNT GitHub secret."
  value       = google_service_account.gh_deployer.email
}

output "workload_identity_provider" {
  description = "Set this as the WIF_PROVIDER GitHub secret."
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "github_actions_vars" {
  description = "Copy these into the GitHub repo's Actions Variables."
  value = {
    GCP_PROJECT_ID = var.project_id
    GCP_REGION     = var.region
    AR_REPO        = google_artifact_registry_repository.app.repository_id
    SERVICE_NAME   = google_cloud_run_v2_service.app.name
    RUNTIME_SA     = google_service_account.runtime.email
    SQL_INSTANCE   = google_sql_database_instance.main.connection_name
    DB_SECRET      = google_secret_manager_secret.database_password.secret_id
    DB_USER        = var.db_user
    DB_NAME        = var.db_name
  }
}
