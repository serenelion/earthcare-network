#!/bin/bash

# 🌍 EarthCare Network - Dokploy Deployment Script
# This script deploys the entire EarthCare Network stack to Dokploy

set -e  # Exit on error

echo "🌍 EarthCare Network - Dokploy Deployment"
echo "=========================================="
echo ""

# Configuration
DOKPLOY_HOST="157.230.173.94"
PROJECT_PATH="/var/lib/dokploy/projects/earthcare-network"
COMPOSE_FILE="docker-compose.dokploy.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if running locally or on server
if [[ $(hostname -I | grep -o "$DOKPLOY_HOST") ]]; then
    echo "📍 Running on Dokploy server"
    IS_SERVER=true
else
    echo "💻 Running locally - will deploy via SSH"
    IS_SERVER=false
fi

# Step 1: Prepare deployment
echo ""
echo "🔧 Step 1: Preparing deployment..."

if [ "$IS_SERVER" = true ]; then
    cd "$PROJECT_PATH"
    
    # Pull latest changes
    print_status "Pulling latest changes from GitHub..."
    git pull origin main || print_warning "Could not pull from git"
    
else
    # Deploy from local machine
    print_status "Deploying from local machine to Dokploy server..."
    
    # Copy files to server
    echo "📦 Copying files to server..."
    rsync -avz --exclude 'node_modules' --exclude '.git' \
        ./ root@${DOKPLOY_HOST}:${PROJECT_PATH}/ \
        || print_error "Failed to copy files"
fi

# Step 2: Build and deploy services
echo ""
echo "🏗️ Step 2: Building and deploying services..."

if [ "$IS_SERVER" = true ]; then
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose -f ${COMPOSE_FILE} down --remove-orphans || true
    
    # Clean up old images
    print_status "Cleaning up old images..."
    docker system prune -f || true
    
    # Build services
    print_status "Building services..."
    docker-compose -f ${COMPOSE_FILE} build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker-compose -f ${COMPOSE_FILE} up -d
    
else
    # Execute on remote server
    ssh root@${DOKPLOY_HOST} << EOF
        cd ${PROJECT_PATH}
        
        # Stop existing containers
        echo "Stopping existing containers..."
        docker-compose -f ${COMPOSE_FILE} down --remove-orphans || true
        
        # Build and start services
        echo "Building services..."
        docker-compose -f ${COMPOSE_FILE} build --no-cache
        
        echo "Starting services..."
        docker-compose -f ${COMPOSE_FILE} up -d
EOF
fi

# Step 3: Wait for services to be ready
echo ""
echo "⏳ Step 3: Waiting for services to start..."

sleep 30

# Step 4: Run database migrations
echo ""
echo "🗄️ Step 4: Running database migrations..."

if [ "$IS_SERVER" = true ]; then
    # Wait for database to be ready
    until docker exec earthcare-postgres pg_isready -U postgres; do
        print_warning "Waiting for PostgreSQL to be ready..."
        sleep 5
    done
    
    print_status "PostgreSQL is ready!"
    
    # Run Twenty migrations
    print_status "Running Twenty CRM migrations..."
    docker exec earthcare-twenty sh -c "yarn workspace twenty-server database:migrate:prod" || \
        print_warning "Migrations may have already been applied"
    
else
    ssh root@${DOKPLOY_HOST} << EOF
        # Wait for database
        until docker exec earthcare-postgres pg_isready -U postgres; do
            echo "Waiting for PostgreSQL..."
            sleep 5
        done
        
        # Run migrations
        docker exec earthcare-twenty sh -c "yarn workspace twenty-server database:migrate:prod" || true
EOF
fi

# Step 5: Health checks
echo ""
echo "🏥 Step 5: Performing health checks..."

# Check PostgreSQL
if docker exec earthcare-postgres pg_isready -U postgres > /dev/null 2>&1; then
    print_status "PostgreSQL is healthy"
else
    print_error "PostgreSQL is not responding"
fi

# Check Redis
if docker exec earthcare-redis redis-cli ping > /dev/null 2>&1; then
    print_status "Redis is healthy"
else
    print_error "Redis is not responding"
fi

# Check Directory
if curl -sSf http://localhost:3003 > /dev/null 2>&1; then
    print_status "Directory is accessible"
else
    print_error "Directory is not responding"
fi

# Check Twenty CRM
if curl -sSf http://localhost:3000/healthz > /dev/null 2>&1; then
    print_status "Twenty CRM is healthy"
else
    print_warning "Twenty CRM health check failed (this may be normal)"
fi

# Step 6: Display summary
echo ""
echo "🎯 Deployment Summary"
echo "====================="
echo ""
echo "📍 Services deployed:"
echo "  • Directory: http://${DOKPLOY_HOST}:3003 → https://app.earthcare.network"
echo "  • Twenty CRM: http://${DOKPLOY_HOST}:3000 → https://crm.app.earthcare.network"
echo "  • PostgreSQL: ${DOKPLOY_HOST}:5432"
echo "  • Redis: ${DOKPLOY_HOST}:6379"
echo ""
echo "📝 Next steps:"
echo "  1. Configure Traefik/Nginx for domain routing"
echo "  2. Set up SSL certificates with Let's Encrypt"
echo "  3. Test the applications via their domains"
echo "  4. Monitor logs: docker-compose -f ${COMPOSE_FILE} logs -f"
echo ""

# Check if domains are accessible
echo "🌐 Testing domain accessibility..."
echo ""

if curl -sSf -m 5 https://app.earthcare.network > /dev/null 2>&1; then
    print_status "https://app.earthcare.network is LIVE! 🎉"
else
    print_warning "https://app.earthcare.network is not accessible yet"
fi

if curl -sSf -m 5 https://crm.app.earthcare.network > /dev/null 2>&1; then
    print_status "https://crm.app.earthcare.network is LIVE! 🎉"
else
    print_warning "https://crm.app.earthcare.network is not accessible yet"
fi

echo ""
echo "🚀 EarthCare Network deployment complete!"
echo "🌱 Ready to heal the world!"
