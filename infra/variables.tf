variable "project_id" {
  description = "GCP project ID to deploy into."
  type        = string
}

variable "region" {
  description = "GCP region for Cloud Run, Cloud SQL, and Artifact Registry."
  type        = string
  default     = "us-central1"
}

variable "app_name" {
  description = "Short identifier used as a prefix for resource names."
  type        = string
  default     = "toodoo"
}

variable "service_name" {
  description = "Cloud Run service name. Used in the *.run.app URL."
  type        = string
  default     = "toodoo"
}

variable "db_tier" {
  description = "Cloud SQL machine tier. db-f1-micro is the cheapest shared-core option (requires edition = ENTERPRISE). For ENTERPRISE_PLUS, use db-perf-optimized-N-2 or similar."
  type        = string
  default     = "db-f1-micro"
}

variable "db_edition" {
  description = "Cloud SQL edition. ENTERPRISE supports shared-core tiers (db-f1-micro, db-g1-small). ENTERPRISE_PLUS requires db-perf-optimized-N-*."
  type        = string
  default     = "ENTERPRISE"
  validation {
    condition     = contains(["ENTERPRISE", "ENTERPRISE_PLUS"], var.db_edition)
    error_message = "db_edition must be ENTERPRISE or ENTERPRISE_PLUS."
  }
}

variable "db_name" {
  description = "Postgres database name."
  type        = string
  default     = "toodoo"
}

variable "db_user" {
  description = "Postgres user that the app connects as."
  type        = string
  default     = "toodoo"
}

variable "deletion_protection" {
  description = "Protect the Cloud SQL instance from accidental deletion. Set to false to allow `terraform destroy`."
  type        = bool
  default     = true
}

variable "github_repo" {
  description = "GitHub repository in `owner/repo` format that is allowed to deploy via Workload Identity Federation."
  type        = string
}

variable "wif_pool_id" {
  description = "Workload Identity Pool ID. Change this if you hit a 409 because a soft-deleted pool with the same name still exists (pools have a 30-day retention)."
  type        = string
  default     = "toodoo-github-pool"
}

variable "wif_provider_id" {
  description = "Workload Identity Pool Provider ID. Same 30-day soft-delete rule as the pool — change to sidestep a 409."
  type        = string
  default     = "github-provider"
}

variable "email_from" {
  description = "EMAIL_FROM env var passed to the app for outbound mail."
  type        = string
  default     = "Toodoo <onboarding@resend.dev>"
}

variable "resend_api_key" {
  description = "Optional. If non-empty, populates the Resend API key secret. Leave blank and add a version manually via gcloud to avoid committing the value."
  type        = string
  default     = ""
  sensitive   = true
}

variable "container_image" {
  description = "Container image used on first Cloud Run create. Subsequent deploys overwrite this from CI; Terraform ignores image drift after creation."
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "min_instances" {
  type    = number
  default = 0
}

variable "max_instances" {
  type    = number
  default = 5
}
