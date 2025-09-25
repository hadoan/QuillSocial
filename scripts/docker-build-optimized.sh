#!/usr/bin/env bash
# Optimized Docker build script using local build artifacts
# Usage: ./scripts/docker-build-optimized.sh [IMAGE_NAME]

set -euo pipefail

IMAGE_NAME=${1:-quillsocial-local}

echo "🚀 Starting local build and Docker optimization for ${IMAGE_NAME}..."

# Step 1: Clean and build locally
echo "📦 Building application locally..."

# Clean manually instead of using yarn script
echo "🧹 Cleaning build artifacts..."
find . -name node_modules -o -name .next -o -name .turbo -o -name dist -type d -prune | xargs rm -rf

# Reinstall dependencies
echo "📦 Installing dependencies..."
yarn install

# Generate Prisma client
echo "🔄 Generating Prisma client..."
yarn prisma generate

# Build with turbo directly
echo "🏗️  Building application..."
npx turbo run build --filter=@quillsocial/web...

# Verify build output exists
if [[ ! -d "apps/web/.next/standalone" ]]; then
    echo "❌ Local build failed - standalone output not found"
    exit 1
fi

echo "✅ Local build completed successfully"

# Step 2: Build Docker image with local artifacts
echo "🐳 Building Docker image with local build artifacts..."

# Enable BuildKit for advanced features
export DOCKER_BUILDKIT=1

# Build with local build artifacts
docker build \
  --platform linux/amd64 \
  --progress=plain \
  -t "${IMAGE_NAME}" \
  -f Dockerfile \
  .

echo "✅ Docker build completed: ${IMAGE_NAME}"
echo "📊 Image size:"
docker images "${IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
echo "📊 Image size:"
docker images "${IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Optional: Run container for testing
if [[ "${2:-}" == "--run" ]]; then
  echo "🔄 Stopping any existing container..."
  docker rm -f "${IMAGE_NAME}" 2>/dev/null || true

  echo "▶️ Running container ${IMAGE_NAME} on port 3000..."
  docker run --name "${IMAGE_NAME}" -p 3000:3000 -d "${IMAGE_NAME}"

  echo "🌐 Container started. Visit http://localhost:3000"
  echo "📋 Container logs: docker logs ${IMAGE_NAME}"
fi
