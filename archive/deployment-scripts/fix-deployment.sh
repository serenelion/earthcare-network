#!/bin/bash

# 🚀 EarthCare Network - Dokploy Deployment Fix
# This script fixes the Bad Gateway and DNS issues

echo "🌍 Fixing EarthCare Network Deployment..."

# 1. Fix Directory Application (502 Bad Gateway)
echo "📁 Building directory application..."
docker build -t earthcare-directory ./directory

# 2. Run directory on port 3003 (for app.earthcare.network)
echo "🌐 Starting directory service..."
docker stop earthcare-directory 2>/dev/null || true
docker rm earthcare-directory 2>/dev/null || true
docker run -d \
  --name earthcare-directory \
  --restart unless-stopped \
  -p 3003:80 \
  earthcare-directory

# 3. Build and run CRM application
echo "💼 Building CRM application..."
docker build -t earthcare-crm -f Dockerfile.twenty .

# 4. Start database services
echo "🗄️ Starting database services..."
docker run -d \
  --name earthcare-postgres \
  --restart unless-stopped \
  -p 5432:5432 \
  -e POSTGRES_DB=twenty \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=KeepGoin!!! \
  -v postgres_data:/var/lib/postgresql/data \
  postgis/postgis:16-3.4-alpine

docker run -d \
  --name earthcare-redis \
  --restart unless-stopped \
  -p 6379:6379 \
  redis:7-alpine

# 5. Wait for database to be ready
echo "⏳ Waiting for database to initialize..."
sleep 30

# 6. Start CRM on port 3000 (for crm.app.earthcare.network)
echo "💼 Starting CRM service..."
docker stop earthcare-crm 2>/dev/null || true
docker rm earthcare-crm 2>/dev/null || true
docker run -d \
  --name earthcare-crm \
  --restart unless-stopped \
  -p 3000:3000 \
  --link earthcare-postgres:postgres \
  --link earthcare-redis:redis \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://postgres:KeepGoin!!!@postgres:5432/twenty \
  -e REDIS_URL=redis://redis:6379 \
  -e SERVER_URL=https://crm.app.earthcare.network \
  -e FRONT_BASE_URL=https://crm.app.earthcare.network \
  -e ACCESS_TOKEN_SECRET=earthcare-access-token-secret-2025 \
  -e REFRESH_TOKEN_SECRET=earthcare-refresh-token-secret-2025 \
  -e LOGIN_TOKEN_SECRET=earthcare-login-token-secret-2025 \
  -e SUPPORT_EMAIL=support@earthcare.network \
  -e PORT=3000 \
  earthcare-crm

echo "✅ EarthCare Network services started successfully!"
echo ""
echo "🌍 Directory: http://157.230.173.94:3003 (should map to app.earthcare.network)"
echo "💼 CRM: http://157.230.173.94:3000 (should map to crm.app.earthcare.network)"
echo ""
echo "🔧 Next: Configure Dokploy to:"
echo "   1. Create app 'earthcare-directory' pointing to port 3003"
echo "   2. Create app 'earthcare-crm' pointing to port 3000"
echo "   3. Set up domain mappings in Dokploy dashboard"