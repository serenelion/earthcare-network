#!/bin/bash

# 🌍 EarthCare Network - Complete Deployment Script
# This script deploys both Twenty CRM and React Directory

echo "🌍 Deploying EarthCare Network..."
echo "================================="

# Step 1: Build and start the services
echo "🏗️ Building and starting services..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

# Step 2: Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 60

# Step 3: Check service health
echo "🏥 Checking service health..."

# Check PostgreSQL
if docker exec earthcare-postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not responding"
fi

# Check Redis
if docker exec earthcare-redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not responding"
fi

# Check Twenty CRM
if curl -sf http://localhost:3000/healthz > /dev/null 2>&1; then
    echo "✅ Twenty CRM is ready"
else
    echo "❌ Twenty CRM is not responding"
fi

# Check Directory
if curl -sf http://localhost:3003 > /dev/null 2>&1; then
    echo "✅ Directory is ready"
else
    echo "❌ Directory is not responding"
fi

echo ""
echo "🎯 Deployment Summary:"
echo "====================="
echo "🌍 Directory: http://localhost:3003 → https://app.earthcare.network"
echo "💼 Twenty CRM: http://localhost:3000 → https://crm.app.earthcare.network"
echo "🗄️ PostgreSQL: localhost:5432"
echo "💾 Redis: localhost:6379"
echo ""
echo "📝 Next Steps:"
echo "1. Configure Dokploy applications to use these ports"
echo "2. Ensure DNS records point to your droplet:"
echo "   - app.earthcare.network A 157.230.173.94"
echo "   - crm.app.earthcare.network A 157.230.173.94"
echo "3. Test the applications work correctly"
echo ""
echo "🚀 EarthCare Network is ready to heal the world!"