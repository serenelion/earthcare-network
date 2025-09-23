#!/bin/bash

# 🧹 Dokploy Server - Container Cleanup Script
# Run this via SSH on your Digital Ocean droplet to resolve conflicts

echo "🧹 Cleaning up Docker conflicts on Dokploy server..."
echo "================================================="

# Step 1: Stop and remove conflicting earthcare containers
echo "🛑 Removing conflicting earthcare containers..."

# Remove by exact names that are causing conflicts
docker stop earthcare-twenty-worker-v2 2>/dev/null || true
docker rm earthcare-twenty-worker-v2 2>/dev/null || true

docker stop earthcare-twenty-server-v2 2>/dev/null || true
docker rm earthcare-twenty-server-v2 2>/dev/null || true

docker stop earthcare-directory-v2 2>/dev/null || true
docker rm earthcare-directory-v2 2>/dev/null || true

docker stop earthcare-postgres-v2 2>/dev/null || true
docker rm earthcare-postgres-v2 2>/dev/null || true

docker stop earthcare-redis-v2 2>/dev/null || true
docker rm earthcare-redis-v2 2>/dev/null || true

# Step 2: Remove containers by specific ID if they exist
echo "🗑️ Removing container by ID: 488f06e6c25c..."
docker stop 488f06e6c25cad459a7e1e8a8a992b3f14bc751d6442c853145f4787007158da 2>/dev/null || true
docker rm 488f06e6c25cad459a7e1e8a8a992b3f14bc751d6442c853145f4787007158da 2>/dev/null || true

# Step 3: Clean up any orphaned earthcare containers
echo "🧽 Cleaning up orphaned containers..."
docker ps -aq --filter "name=earthcare" | xargs docker stop 2>/dev/null || true
docker ps -aq --filter "name=earthcare" | xargs docker rm 2>/dev/null || true

# Step 4: Free up ports used by EarthCare Network
echo "🔌 Freeing up ports..."
docker stop $(docker ps -q --filter "publish=3000") 2>/dev/null || true
docker stop $(docker ps -q --filter "publish=3003") 2>/dev/null || true
docker stop $(docker ps -q --filter "publish=5432") 2>/dev/null || true
docker stop $(docker ps -q --filter "publish=6379") 2>/dev/null || true

# Step 5: Clean up networks
echo "🌐 Cleaning up networks..."
docker network rm twenty_earthcare-network 2>/dev/null || true
docker network prune -f 2>/dev/null || true

# Step 6: Show current state
echo "📊 Current Docker state after cleanup:"
echo "====================================="
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"

echo ""
echo "✅ Dokploy server cleanup complete!"
echo ""
echo "🚀 Ready to deploy EarthCare Network:"
echo "1. Directory app should deploy cleanly now"
echo "2. CRM app should deploy without container conflicts"
echo "3. All port conflicts resolved"