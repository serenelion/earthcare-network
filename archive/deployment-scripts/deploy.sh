#!/bin/bash

# EarthCare Network Deployment Script for Dokploy
# Run this script to deploy the complete stack to Digital Ocean

set -e

echo "🌍 Starting EarthCare Network Deployment..."

# Configuration
DROPLET_IP="157.230.173.94"
DOKPLOY_PORT="3000"
PROJECT_NAME="earthcare-network"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Check Dokploy connectivity
print_status "Checking Dokploy connectivity..."
if curl -s -f "http://${DROPLET_IP}:${DOKPLOY_PORT}" > /dev/null; then
    print_success "Dokploy is accessible at ${DROPLET_IP}:${DOKPLOY_PORT}"
else
    print_error "Cannot connect to Dokploy. Please check your droplet status."
    exit 1
fi

# Step 2: Create deployment package
print_status "Creating deployment package..."
rm -rf ./deployment-package
mkdir -p ./deployment-package

# Copy essential files
cp docker-compose.production.yml ./deployment-package/docker-compose.yml
cp .env.production ./deployment-package/.env
cp nginx.conf ./deployment-package/
cp -r directory ./deployment-package/

# Copy Twenty CRM files (if building from source)
if [ -d "packages" ]; then
    print_status "Copying Twenty CRM source files..."
    cp -r packages ./deployment-package/
    cp package.json ./deployment-package/ 2>/dev/null || true
    cp yarn.lock ./deployment-package/ 2>/dev/null || true
fi

print_success "Deployment package created"

# Step 3: Create tar archive for upload
print_status "Creating deployment archive..."
tar -czf earthcare-deployment.tar.gz -C deployment-package .
print_success "Deployment archive created: earthcare-deployment.tar.gz"

# Step 4: Display deployment instructions
cat << EOF

🎯 DEPLOYMENT INSTRUCTIONS:

1. Access Dokploy Dashboard:
   Open: http://${DROPLET_IP}:${DOKPLOY_PORT}
   Login: arye@earthcare.network
   Password: KeepGoin!!!

2. Create New Application:
   - Click "Create Application"
   - Name: earthcare-network
   - Type: Docker Compose
   - Source: Upload (use earthcare-deployment.tar.gz)

3. Configure Environment Variables:
   Copy from .env.production file and update:
   - APOLLO_API_KEY (get from apollo.io)
   - LINKEDIN_API_KEY (get from LinkedIn Developer)
   - HUNTER_API_KEY (get from hunter.io)
   - SPATIAL_NETWORK_API_KEY (get from Spatial Network)
   - EMAIL_SMTP_PASSWORD (your email credentials)

4. Configure Domains in Dokploy:
   - api.earthcare.network → Port 3001
   - crm.app.earthcare.network → Port 3002  
   - app.earthcare.network → Port 3003

5. DNS Configuration Required:
   Add these DNS records to your domain:
   - api.earthcare.network    A    ${DROPLET_IP}
   - crm.app.earthcare.network    A    ${DROPLET_IP}
   - app.earthcare.network    A    ${DROPLET_IP}

6. SSL Certificates:
   Dokploy will automatically generate Let's Encrypt certificates
   for all configured domains.

EOF

# Step 5: Quick connectivity test
print_status "Testing current services on droplet..."

# Test if ports are accessible
for port in 3001 3002 3003; do
    if nc -z ${DROPLET_IP} ${port} 2>/dev/null; then
        print_success "Port ${port} is accessible"
    else
        print_warning "Port ${port} is not accessible (expected before deployment)"
    fi
done

print_success "Deployment preparation complete!"
print_warning "Next: Upload earthcare-deployment.tar.gz to Dokploy dashboard"

echo ""
echo "📋 QUICK START CHECKLIST:"
echo "□ Upload deployment package to Dokploy"
echo "□ Configure environment variables"
echo "□ Set up domain routing"
echo "□ Configure DNS records"
echo "□ Deploy and test services"
echo "□ Verify SSL certificates"
echo "□ Test monetization workflows"

EOF