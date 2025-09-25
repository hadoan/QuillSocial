# Deploying QuillSocial to Google Cloud Run

This file documents a simple workflow to build locally (Docker) and deploy to Cloud Run.

Prerequisites

1. Install Google Cloud CLI and authenticate: `gcloud auth login`
2. Set your project: `gcloud config set project [PROJECT_ID]`
3. Enable Container Registry and Cloud Run APIs:

```bash
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

Local Docker build and run (quick test)

```bash
# Build and run locally
./scripts/docker-deploy-local.sh quillsocial-local
# Visit http://localhost:3000
```

Deploy to Cloud Run (build locally, push to GCR, deploy)

```bash
# From repo root
./scripts/deploy-cloudrun.sh [PROJECT-ID] [SERVICE_NAME] [REGION]
# Example
./scripts/deploy-cloudrun.sh my-gcp-project quillsocial-backend us-central1
```

Notes

- The `Dockerfile` expects `.env.production` at repo root during the build stage. Ensure your production env file contains required variables (DO NOT commit secrets in git).
- The `deploy-cloudrun.sh` script tags the image with a timestamp to avoid collisions.
- After deployment the script will set `CLOUD_RUN_URL` env var on the service with the deployed URL.

Advanced

- To use Google Cloud Build instead (no local Docker required):

```bash
# from repo root
gcloud builds submit --tag gcr.io/[PROJECT-ID]/quillsocial-backend
```

- For custom domains, use `gcloud run domain-mappings create ...` (see Google Cloud docs).
