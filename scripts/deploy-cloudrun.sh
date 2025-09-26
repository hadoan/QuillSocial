#!/usr/bin/env bash
# Deploy QuillSocial to Google Cloud Run
# Usage: ./scripts/deploy-cloudrun.sh <GCP_PROJECT_ID> <SERVICE_NAME> [REGION]

set -euo pipefail
PROJECT_ID=${1:-}
SERVICE_NAME=${2:-quillsocial-backend}
REGION=${3:-us-central1}
IMAGE_NAME=gcr.io/${PROJECT_ID}/${SERVICE_NAME}
BUILD_TAG=${IMAGE_NAME}:$(date +%s)

if [ -z "$PROJECT_ID" ]; then
  echo "Usage: $0 <GCP_PROJECT_ID> <SERVICE_NAME> [REGION]"
  exit 1
fi

echo "Building Docker image locally..."
docker build --platform linux/amd64 -t ${BUILD_TAG} -f Dockerfile .

echo "Pushing image to Container Registry: ${BUILD_TAG}"
docker push ${BUILD_TAG}

echo "Deploying to Cloud Run: ${SERVICE_NAME} in ${REGION}"

# Check if service already exists to preserve configuration
if gcloud run services describe ${SERVICE_NAME} --platform managed --region ${REGION} &>/dev/null; then
  echo "Service exists, preserving existing configuration..."
  gcloud run deploy ${SERVICE_NAME} \
    --image ${BUILD_TAG} \
    --platform managed \
    --region ${REGION}
else
  echo "Creating new service with default configuration..."
  gcloud run deploy ${SERVICE_NAME} \
    --image ${BUILD_TAG} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --port 3000 \
    --memory 1Gi \
    --cpu 1
fi

SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --platform managed --region ${REGION} --format="value(status.url)")

echo "Deployed. Service URL: ${SERVICE_URL}"

echo "Updating service with CLOUD_RUN_URL env var (preserving existing variables)"
gcloud run services update ${SERVICE_NAME} --region ${REGION} --update-env-vars "CLOUD_RUN_URL=${SERVICE_URL}"

echo "Done."
