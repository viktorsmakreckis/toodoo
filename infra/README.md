# Infrastructure

Terraform that provisions everything needed to run Toodoo on GCP:

- **Cloud Run** — the SvelteKit Node server
- **Cloud SQL** — managed Postgres 16, connected via Unix socket
- **Artifact Registry** — Docker repo for built images
- **Secret Manager** — DATABASE_URL, BETTER_AUTH_SECRET, RESEND_API_KEY
- **Workload Identity Federation** — GitHub Actions deploys without long-lived JSON keys

## Prerequisites

- `gcloud` CLI, authenticated as a user with `Owner` (or equivalent) on the project
- `terraform` >= 1.7
- A GCP project with billing enabled

## Bootstrap

```bash
# 1. Set the target project
export PROJECT_ID="your-gcp-project"
gcloud config set project "$PROJECT_ID"
gcloud auth application-default login

# 2. Configure variables
cd infra
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars — at minimum set project_id and github_repo

# 3. Apply
terraform init
terraform apply
```

The first apply enables APIs, creates the SA, AR, Cloud SQL, secrets, and a
placeholder Cloud Run service (running `gcr.io/cloudrun/hello`). CI replaces
the image on the next push to `main`.

## Wire up GitHub Actions

After `terraform apply` finishes, read the outputs:

```bash
terraform output -json github_actions_vars
terraform output workload_identity_provider
terraform output deployer_service_account_email
```

In your GitHub repo settings:

**Secrets** (Settings → Secrets and variables → Actions → Secrets):

| Name                  | Value                                   |
| --------------------- | --------------------------------------- |
| `WIF_PROVIDER`        | `workload_identity_provider` output     |
| `WIF_SERVICE_ACCOUNT` | `deployer_service_account_email` output |

**Variables** (Settings → Secrets and variables → Actions → Variables):

Copy every key/value pair from the `github_actions_vars` output.

## Populate the Resend secret

The Terraform creates an empty `toodoo-resend-api-key` secret container. Add
the actual key:

```bash
echo -n "re_your_resend_key" | \
  gcloud secrets versions add toodoo-resend-api-key --data-file=-
```

Cloud Run picks up the new version on the next revision deploy (or run
`gcloud run services update toodoo --region=us-central1` to roll one now).

## Reconcile ORIGIN with the real Cloud Run URL

`ORIGIN` is passed to better-auth as `baseURL` and to SvelteKit as its CSRF
trusted origin. On first apply, Terraform sets it to the predicted modern
URL (`https://<service>-<project-number>.<region>.run.app`). If your project
falls back to the legacy hash-based URL (`https://<service>-<hash>-<region-code>.a.run.app`),
sign-up will fail with `Invalid origin`.

After the first apply, compare the two outputs:

```bash
terraform output cloud_run_url        # what Cloud Run actually serves
terraform output configured_origin    # what the app is told it is
```

If they differ, paste the real URL into `terraform.tfvars` and re-apply:

```hcl
origin_override = "https://toodoo-abc123-ew.a.run.app"
```

```bash
terraform apply
```

## Run database migrations

The first time, and after schema changes:

**Option A — GitHub Actions** (recommended once everything is wired up): go to
the `Run DB Migrations` workflow in the Actions tab and click _Run workflow_.

**Option B — Locally** via Cloud SQL Auth Proxy:

```bash
# In one terminal:
cloud-sql-proxy "$(terraform output -raw cloud_sql_instance_connection_name)" --port 5432

# In another, from the repo root:
DB_PASSWORD=$(gcloud secrets versions access latest --secret=toodoo-database-password)
DATABASE_URL="postgres://toodoo:${DB_PASSWORD}@127.0.0.1:5432/toodoo" pnpm db:migrate
```

## Subsequent deploys

Pushes to `main` build the image and call `gcloud run deploy`. Terraform is
configured to ignore image drift, so CI and IaC stay out of each other's way.

To change infrastructure (env vars, scaling, secrets), edit the `.tf` files
and `terraform apply`.

## Remote state (optional but recommended)

Local state lives in `infra/terraform.tfstate` and is gitignored. For shared
state, create a GCS bucket once:

```bash
gcloud storage buckets create "gs://${PROJECT_ID}-tfstate" \
  --location="$REGION" \
  --uniform-bucket-level-access
gcloud storage buckets update "gs://${PROJECT_ID}-tfstate" --versioning
```

Then uncomment the `backend "gcs"` block in `versions.tf`, set the bucket
name, and run `terraform init -migrate-state`.

## Troubleshooting

### `Error 409: Requested entity already exists` on `google_iam_workload_identity_pool.github`

A pool with this ID already exists in the project — usually a soft-deleted
remnant from a previous apply (WIF pools have a 30-day retention).

**Option A — undelete and import the existing pool** (preserves federation):

```bash
gcloud iam workload-identity-pools undelete toodoo-github-pool --location=global || true
terraform import google_iam_workload_identity_pool.github \
  projects/${PROJECT_ID}/locations/global/workloadIdentityPools/toodoo-github-pool
terraform import google_iam_workload_identity_pool_provider.github \
  projects/${PROJECT_ID}/locations/global/workloadIdentityPools/toodoo-github-pool/providers/github-provider
terraform apply
```

**Option B — use a different pool ID:**

```hcl
# terraform.tfvars
wif_pool_id = "toodoo-github-pool-2"
```

### `Secret projects/.../versions/latest was not found` on Cloud Run create

Fixed in the current Terraform — Resend's secret is always seeded with a
`REPLACE_ME` placeholder so Cloud Run can resolve `latest`. After apply, put
the real key in:

```bash
echo -n "re_your_key" | gcloud secrets versions add toodoo-resend-api-key --data-file=-
gcloud run services update toodoo --region=us-central1   # roll a new revision
```

If you hit this on an older apply, re-run `terraform apply` after pulling the
fix.

## Tearing down

```bash
# First, set deletion_protection = false in terraform.tfvars and apply.
terraform destroy
```

Cloud SQL has its own deletion protection — flip `deletion_protection` to
`false` and `terraform apply` once before destroy.

## Cost notes

Rough monthly cost with zero traffic and defaults:

- Cloud Run scale-to-zero: ~$0
- Cloud SQL `db-f1-micro`: ~$7-10 + ~$1.70 for 10 GiB SSD
- Artifact Registry storage: pennies per image
- Secret Manager: free tier covers this

Expect ~$10-15/mo idle. Bumping `db_tier` to `db-custom-1-3840` brings it to
~$25-30/mo if shared-core isn't available in your region.
