#!/bin/bash

# Deploy EarthCare Network using Docker Compose
set -e

echo "🚀 Deploying EarthCare Network..."

# Navigate to deployment directory
cd /opt/earthcare-deployment

# Stop any existing services
echo "🛑 Stopping existing services..."
docker-compose -f docker-compose.dokploy.yml down --remove-orphans 2>/dev/null || true

# Clean up unused resources
echo "🧹 Cleaning up resources..."
docker system prune -f

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose -f docker-compose.dokploy.yml pull

# Start services
echo "🎬 Starting services..."
docker-compose -f docker-compose.dokploy.yml --env-file .env.production up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service status
echo "🔍 Checking service status..."
docker-compose -f docker-compose.dokploy.yml ps

# Test endpoints
echo "🧪 Testing endpoints..."
echo "Testing Twenty CRM..."
curl -I http://localhost:3000/healthz || echo "CRM health check failed"

echo "Testing Directory..."
curl -I http://localhost:8080/ || echo "Directory check failed"

echo "Testing MCP Server..."
curl -I http://localhost:8090/ || echo "MCP Server check failed"

echo "✅ Deployment complete!"
echo "🌐 Services:"
echo "   - Twenty CRM: http://localhost:3000 (→ https://crm.app.earthcare.network)"
echo "   - Directory: http://localhost:8080 (→ https://app.earthcare.network)"
echo "   - MCP Server: http://localhost:8090 (→ https://mcp.earthcare.network)"
echo ""
echo "📋 Next: Configure domains in Dokploy dashboard at http://157.230.173.94:3000"