resource "random_password" "db" {
  length  = 32
  special = false
  upper   = true
  lower   = true
  numeric = true
}

resource "google_sql_database_instance" "main" {
  name             = "${var.app_name}-pg"
  database_version = "POSTGRES_16"
  region           = var.region

  settings {
    tier              = var.db_tier
    edition           = var.db_edition
    availability_type = "ZONAL"
    disk_size         = 10
    disk_autoresize   = true

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = false
    }

    # Public IP enabled so you can run migrations from your laptop via the
    # Cloud SQL Auth Proxy. Cloud Run uses the Unix socket regardless of this.
    ip_configuration {
      ipv4_enabled = true
    }

    insights_config {
      query_insights_enabled = true
    }
  }

  deletion_protection = var.deletion_protection

  depends_on = [google_project_service.enabled]
}

resource "google_sql_database" "app" {
  name     = var.db_name
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "app" {
  name     = var.db_user
  instance = google_sql_database_instance.main.name
  password = random_password.db.result
}
