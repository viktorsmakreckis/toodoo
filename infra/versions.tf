terraform {
  required_version = ">= 1.7.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.10"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Uncomment after creating a GCS bucket for state. See infra/README.md.
  # backend "gcs" {
  #   bucket = "toodoo-tfstate"
  #   prefix = "infra"
  # }
}
