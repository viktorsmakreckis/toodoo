resource "google_service_account" "runtime" {
  account_id   = "${var.app_name}-runtime"
  display_name = "Cloud Run runtime SA for ${var.app_name}"

  depends_on = [google_project_service.enabled]
}

resource "google_project_iam_member" "runtime_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_service_account" "gh_deployer" {
  account_id   = "${var.app_name}-gh-deployer"
  display_name = "GitHub Actions deployer for ${var.app_name}"

  depends_on = [google_project_service.enabled]
}

resource "google_project_iam_member" "deployer_ar_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.gh_deployer.email}"
}

resource "google_project_iam_member" "deployer_run_developer" {
  project = var.project_id
  role    = "roles/run.developer"
  member  = "serviceAccount:${google_service_account.gh_deployer.email}"
}

resource "google_project_iam_member" "deployer_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.gh_deployer.email}"
}

# Cloud Run deploys need to "actAs" the runtime service account.
resource "google_service_account_iam_member" "deployer_acts_as_runtime" {
  service_account_id = google_service_account.runtime.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.gh_deployer.email}"
}
