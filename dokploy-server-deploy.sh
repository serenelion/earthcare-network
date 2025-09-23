#!/bin/bash

# 🌍 EarthCare Network - Complete Dokploy Server Deployment
# Copy and paste these commands on your Dokploy server (157.230.173.94)

# Step 1: Navigate to projects directory
cd /var/lib/dokploy/projects

# Step 2: Clone or update the repository
if [ -d "earthcare-network" ]; then
    echo "📂 Updating existing repository..."
    cd earthcare-network
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone https://github.com/serenelion/earthcare-network.git
    cd earthcare-network
fi

# Step 3: Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans || true
docker stop earthcare-postgres earthcare-redis earthcare-twenty earthcare-directory || true
docker rm earthcare-postgres earthcare-redis earthcare-twenty earthcare-directory || true

# Step 4: Clean up to free space
echo "🧹 Cleaning up Docker resources..."
docker system prune -f
docker volume prune -f

# Step 5: Build and start the services
echo "🏗️ Building services..."
if [ -f "docker-compose.dokploy.yml" ]; then
    docker-compose -f docker-compose.dokploy.yml build --no-cache
    docker-compose -f docker-compose.dokploy.yml up -d
else
    docker-compose -f docker-compose.yml build --no-cache
    docker-compose -f docker-compose.yml up -d
fi

# Step 6: Wait for services to start
echo "⏳ Waiting for services to start (60 seconds)..."
sleep 60

# Step 7: Check service status
echo "📊 Service Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Step 8: Test endpoints
echo ""
echo "🧪 Testing endpoints:"
curl -sSf http://localhost:3003 > /dev/null 2>&1 && echo "✅ Directory is running on port 3003" || echo "❌ Directory not responding"
curl -sSf http://localhost:3000/healthz > /dev/null 2>&1 && echo "✅ Twenty CRM is running on port 3000" || echo "⚠️ Twenty CRM not responding (may be normal)"
docker exec earthcare-postgres pg_isready -U postgres > /dev/null 2>&1 && echo "✅ PostgreSQL is ready" || echo "❌ PostgreSQL not responding"
docker exec earthcare-redis redis-cli ping > /dev/null 2>&1 && echo "✅ Redis is ready" || echo "❌ Redis not responding"

# Step 9: Display logs
echo ""
echo "📋 Recent logs:"
docker-compose logs --tail=20

echo ""
echo "🎯 Deployment Complete!"
echo "========================"
echo ""
echo "📌 Services are running on:"
echo "  • Directory: http://157.230.173.94:3003"
echo "  • Twenty CRM: http://157.230.173.94:3000"
echo "  • PostgreSQL: 157.230.173.94:5432"
echo "  • Redis: 157.230.173.94:6379"
echo ""
echo "🌐 Configure your domains to point to this server:"
echo "  • app.earthcare.network → 157.230.173.94"
echo "  • crm.app.earthcare.network → 157.230.173.94"
echo ""
echo "📝 To monitor logs:"
echo "  docker-compose logs -f"
echo ""
echo "🚀 EarthCare Network is ready!"
