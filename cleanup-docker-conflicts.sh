#!/bin/bash

# 🧹 EarthCare Network - Docker Cleanup Script
# This script resolves container name and port conflicts

echo "🧹 Cleaning up Docker conflicts for EarthCare Network..."
echo "======================================================"

# Step 1: Stop and remove all conflicting containers
echo "🛑 Stopping conflicting containers..."

# Remove earthcare containers by name
docker stop earthcare-redis earthcare-postgres earthcare-directory earthcare-crm earthcare-twenty-server earthcare-twenty-worker 2>/dev/null || true
docker rm earthcare-redis earthcare-postgres earthcare-directory earthcare-crm earthcare-twenty-server earthcare-twenty-worker 2>/dev/null || true

# Remove containers using the same ports
echo "🔌 Freeing up conflicting ports..."
docker stop $(docker ps -q --filter "publish=3000") 2>/dev/null || true
docker stop $(docker ps -q --filter "publish=3003") 2>/dev/null || true
docker stop $(docker ps -q --filter "publish=5432") 2>/dev/null || true
docker stop $(docker ps -q --filter "publish=6379") 2>/dev/null || true

docker rm $(docker ps -aq --filter "publish=3000") 2>/dev/null || true
docker rm $(docker ps -aq --filter "publish=3003") 2>/dev/null || true
docker rm $(docker ps -aq --filter "publish=5432") 2>/dev/null || true
docker rm $(docker ps -aq --filter "publish=6379") 2>/dev/null || true

# Step 2: Remove old deployment containers
echo "🗑️ Removing old deployment containers..."
docker stop $(docker ps -aq --filter "name=earthcare-deployment") 2>/dev/null || true
docker rm $(docker ps -aq --filter "name=earthcare-deployment") 2>/dev/null || true

docker stop $(docker ps -aq --filter "name=earthcarenetwork") 2>/dev/null || true
docker rm $(docker ps -aq --filter "name=earthcarenetwork") 2>/dev/null || true

# Step 3: Clean up docker compose stacks
echo "📦 Cleaning up compose stacks..."
docker-compose down --remove-orphans --volumes 2>/dev/null || true

# Step 4: Clean up unused networks
echo "🌐 Cleaning up networks..."
docker network prune -f 2>/dev/null || true

# Step 5: Clean up unused volumes (be careful with data)
echo "💾 Cleaning up unused volumes..."
docker volume prune -f 2>/dev/null || true

# Step 6: Remove dangling images
echo "🖼️ Cleaning up images..."
docker image prune -f 2>/dev/null || true

# Step 7: Show current state
echo "📊 Current Docker state:"
echo "======================="
echo "Running containers:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"

echo ""
echo "Available ports:"
echo "Port 3000: $(if ss -tlnp | grep :3000 >/dev/null; then echo "❌ IN USE"; else echo "✅ FREE"; fi)"
echo "Port 3003: $(if ss -tlnp | grep :3003 >/dev/null; then echo "❌ IN USE"; else echo "✅ FREE"; fi)"
echo "Port 5432: $(if ss -tlnp | grep :5432 >/dev/null; then echo "❌ IN USE"; else echo "✅ FREE"; fi)"
echo "Port 6379: $(if ss -tlnp | grep :6379 >/dev/null; then echo "❌ IN USE"; else echo "✅ FREE"; fi)"

echo ""
echo "✅ Docker cleanup complete!"
echo "🚀 Ready to deploy EarthCare Network"
echo ""
echo "Next steps:"
echo "1. Run: docker-compose up -d"
echo "2. Or run: ./deploy-earthcare-network.sh"