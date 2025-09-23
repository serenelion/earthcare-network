#!/bin/bash

# 🔧 Fix Dokploy Deployment Script
# This script cleans up broken containers and redeploys properly

echo "🧹 Cleaning up EarthCare Network deployment..."

# Step 1: Clean up old/broken containers
echo "🗑️ Removing broken containers..."
docker stop earthcare-deployment-mcp-server-1 2>/dev/null || true
docker rm earthcare-deployment-mcp-server-1 2>/dev/null || true

docker stop earthcare-deployment-crm-proxy-1 2>/dev/null || true  
docker rm earthcare-deployment-crm-proxy-1 2>/dev/null || true

# Remove any failed CRM containers
docker stop earthcare-crm 2>/dev/null || true
docker rm earthcare-crm 2>/dev/null || true

# Step 2: Keep working containers (postgres, redis, directory)
echo "✅ Keeping working containers:"
echo "   - earthcare-deployment-directory-1 (nginx:alpine)"
echo "   - earthcare-deployment-postgres-1 (postgis/postgis:15-3.3)"  
echo "   - earthcare-deployment-redis-1 (redis:7-alpine)"

# Step 3: Test directory service
echo "🧪 Testing directory service..."
if curl -sSf http://localhost:3003 > /dev/null 2>&1; then
    echo "✅ Directory service is working on port 3003"
else
    echo "❌ Directory service needs restart"
    docker restart earthcare-deployment-directory-1 2>/dev/null || echo "No directory container to restart"
fi

# Step 4: Check database connectivity
echo "🗄️ Testing database connection..."
if docker exec earthcare-deployment-postgres-1 pg_isready -U postgres 2>/dev/null; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL needs attention"
fi

# Step 5: Check Redis
echo "💾 Testing Redis connection..."
if docker exec earthcare-deployment-redis-1 redis-cli ping 2>/dev/null; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis needs attention"
fi

echo ""
echo "🎯 Next Steps for Dokploy:"
echo "========================="
echo "1. Update earthcare-directory app to use docker-compose.simple.yml"
echo "2. Remove earthcare-crm app temporarily (until CRM build is fixed)"
echo "3. Focus on getting directory service working first"
echo ""
echo "📝 Dokploy Configuration:"
echo "   - App: earthcare-directory"
echo "   - Compose File: docker-compose.simple.yml"
echo "   - Service: directory"
echo "   - Domain: app.earthcare.network"
echo "   - Port: 3003"
echo ""
echo "🌍 After fix, test: https://app.earthcare.network"