resource "random_password" "auth_secret" {
  length  = 64
  special = false
}

resource "google_secret_manager_secret" "database_url" {
  secret_id = "${var.app_name}-database-url"

  replication {
    auto {}
  }

  depends_on = [google_project_service.enabled]
}

resource "google_secret_manager_secret_version" "database_url" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = "postgres://${var.db_user}:${random_password.db.result}@/${var.db_name}?host=/cloudsql/${google_sql_database_instance.main.connection_name}"
}

resource "google_secret_manager_secret" "auth_secret" {
  secret_id = "${var.app_name}-better-auth-secret"

  replication {
    auto {}
  }

  depends_on = [google_project_service.enabled]
}

resource "google_secret_manager_secret_version" "auth_secret" {
  secret      = google_secret_manager_secret.auth_secret.id
  secret_data = random_password.auth_secret.result
}

resource "google_secret_manager_secret" "resend_api_key" {
  secret_id = "${var.app_name}-resend-api-key"

  replication {
    auto {}
  }

  depends_on = [google_project_service.enabled]
}

# Always seed a version so Cloud Run can resolve `latest` on first deploy.
# After apply, replace the value with the real key:
#   echo -n "re_..." | gcloud secrets versions add toodoo-resend-api-key --data-file=-
# `ignore_changes` means Terraform won't revert that manual update on later applies.
resource "google_secret_manager_secret_version" "resend_api_key" {
  secret      = google_secret_manager_secret.resend_api_key.id
  secret_data = var.resend_api_key == "" ? "REPLACE_ME" : var.resend_api_key

  lifecycle {
    ignore_changes = [secret_data]
  }
}

# Direct-access secret for migration jobs that connect over the Cloud SQL Auth
# Proxy (TCP) instead of the Unix socket Cloud Run uses.
resource "google_secret_manager_secret" "database_password" {
  secret_id = "${var.app_name}-database-password"

  replication {
    auto {}
  }

  depends_on = [google_project_service.enabled]
}

resource "google_secret_manager_secret_version" "database_password" {
  secret      = google_secret_manager_secret.database_password.id
  secret_data = random_password.db.result
}

# Grant the runtime SA access to the three secrets it needs at runtime.
resource "google_secret_manager_secret_iam_member" "runtime_database_url" {
  secret_id = google_secret_manager_secret.database_url.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_secret_manager_secret_iam_member" "runtime_auth_secret" {
  secret_id = google_secret_manager_secret.auth_secret.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_secret_manager_secret_iam_member" "runtime_resend_api_key" {
  secret_id = google_secret_manager_secret.resend_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.runtime.email}"
}

# The deployer SA reads the migration password when running drizzle migrations.
resource "google_secret_manager_secret_iam_member" "deployer_database_password" {
  secret_id = google_secret_manager_secret.database_password.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.gh_deployer.email}"
}
