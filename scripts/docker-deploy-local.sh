#!/usr/bin/env bash
# Build and run the Docker image locally for testing
# Usage: ./scripts/docker-deploy-local.sh [IMAGE_NAME]
set -euo pipefail
IMAGE_NAME=${1:-quillsocial-local}

echo "Building image ${IMAGE_NAME}..."
docker build --platform linux/amd64 -t ${IMAGE_NAME} -f Dockerfile .

echo "Stopping any existing container..."
docker rm -f ${IMAGE_NAME} || true

echo "Running container ${IMAGE_NAME} (port 3000)..."
docker run --platform linux/amd64 --name ${IMAGE_NAME} -p 3000:3000 -e NODE_ENV=production -e PORT=3000 -d ${IMAGE_NAME}

echo "Container started. Visit http://localhost:3000"
