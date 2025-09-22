#!/bin/bash

# Quick deployment script for EarthCare Network
set -e

echo "🚀 Quick deploying EarthCare Network services..."

# Upload files
sshpass -p 'BrG5e=n_Nd4B!zP' scp -o StrictHostKeyChecking=no docker-compose.simple.yml nginx.conf root@157.230.173.94:/opt/earthcare-deployment/

# Run deployment
sshpass -p 'BrG5e=n_Nd4B!zP' ssh root@157.230.173.94 -o StrictHostKeyChecking=no << 'EOF'
cd /opt/earthcare-deployment

# Stop any existing services
docker-compose -f docker-compose.simple.yml down --remove-orphans 2>/dev/null || true

# Start essential services first
echo "🗄️ Starting database services..."
docker-compose -f docker-compose.simple.yml --env-file .env.production up -d postgres redis

# Wait for database
echo "⏳ Waiting for database..."
sleep 15

# Start application services
echo "🌐 Starting application services..."
docker-compose -f docker-compose.simple.yml --env-file .env.production up -d directory mcp-server crm-proxy

# Check status
echo "📊 Service status:"
docker-compose -f docker-compose.simple.yml ps

echo "✅ Quick deployment complete!"
echo "🌐 Access points:"
echo "   - Directory: http://157.230.173.94:8080"
echo "   - MCP Server: http://157.230.173.94:8090"
echo "   - CRM Proxy: http://157.230.173.94:3000"
echo "   - Dokploy: http://157.230.173.94:3000"
EOF

echo "🎉 Deployment complete! Now configure domains in Dokploy."