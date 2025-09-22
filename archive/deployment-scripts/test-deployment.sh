#!/bin/bash

# EarthCare Network Pre-Deployment Test Script
# Run this before uploading to Dokploy to ensure everything is ready

set -e

# Configuration
DROPLET_IP="157.230.173.94"
DOKPLOY_PORT="3000"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo "🌍 EarthCare Network Pre-Deployment Verification"
echo "================================================"

# Test 1: Verify deployment package exists
print_header "Checking Deployment Package"
if [ -f "earthcare-deployment.tar.gz" ]; then
    size=$(ls -lh earthcare-deployment.tar.gz | awk '{print $5}')
    print_success "Deployment package exists (${size})"
else
    print_error "Deployment package not found! Run ./deploy.sh first"
    exit 1
fi

# Test 2: Verify Dokploy connectivity
print_header "Testing Dokploy Connectivity"
if curl -s -f -m 10 "http://${DROPLET_IP}:${DOKPLOY_PORT}" > /dev/null; then
    print_success "Dokploy is accessible at ${DROPLET_IP}:${DOKPLOY_PORT}"
else
    print_error "Cannot connect to Dokploy at ${DROPLET_IP}:${DOKPLOY_PORT}"
    exit 1
fi

# Test 3: Check local directory service
print_header "Testing Local Directory Service"
if curl -s -f -m 5 "http://localhost:8081" > /dev/null; then
    print_success "Local directory service is running on port 8081"
    
    # Test specific pages
    if curl -s -f "http://localhost:8081/about.html" > /dev/null; then
        print_success "About page accessible"
    else
        print_warning "About page not accessible"
    fi
    
    if curl -s -f "http://localhost:8081/sponsors.html" > /dev/null; then
        print_success "Sponsors page accessible"  
    else
        print_warning "Sponsors page not accessible"
    fi
    
else
    print_warning "Local directory service not running (not required for deployment)"
fi

# Test 4: Verify essential files in deployment package
print_header "Verifying Deployment Package Contents"
if [ -d "deployment-package" ]; then
    
    # Check Docker Compose file
    if [ -f "deployment-package/docker-compose.yml" ]; then
        print_success "Docker Compose configuration present"
    else
        print_error "Docker Compose file missing"
    fi
    
    # Check environment file
    if [ -f "deployment-package/.env" ]; then
        print_success "Environment configuration present"
    else
        print_error "Environment file missing"
    fi
    
    # Check directory files
    if [ -d "deployment-package/directory" ]; then
        print_success "Directory files present"
        
        # Check key HTML files
        for file in "index.html" "about.html" "sponsors.html"; do
            if [ -f "deployment-package/directory/$file" ]; then
                print_success "  └─ $file ✓"
            else
                print_error "  └─ $file missing"
            fi
        done
    else
        print_error "Directory folder missing"
    fi
    
    # Check Twenty CRM source
    if [ -d "deployment-package/packages" ]; then
        print_success "Twenty CRM source code present"
    else
        print_warning "Twenty CRM source not included (will use Docker images)"
    fi
    
else
    print_error "Deployment package folder not found"
fi

# Test 5: Check network connectivity to target domains
print_header "Testing Target Domain Connectivity"
domains=("api.earthcare.network" "crm.app.earthcare.network" "app.earthcare.network")

for domain in "${domains[@]}"; do
    if nslookup "$domain" > /dev/null 2>&1; then
        ip=$(nslookup "$domain" | grep -A1 "Name:" | tail -1 | awk '{print $2}')
        if [ "$ip" = "$DROPLET_IP" ]; then
            print_success "$domain → $ip (correct)"
        else
            print_warning "$domain → $ip (should be $DROPLET_IP)"
        fi
    else
        print_warning "$domain - DNS not configured yet"
    fi
done

# Test 6: Verify environment variables are set
print_header "Checking Environment Configuration"
if [ -f "deployment-package/.env" ]; then
    
    # Check for placeholder values that need to be replaced
    placeholders=("your_apollo_api_key_here" "your_linkedin_api_key_here" "your_hunter_api_key_here")
    
    for placeholder in "${placeholders[@]}"; do
        if grep -q "$placeholder" "deployment-package/.env"; then
            print_warning "API key placeholder detected: $placeholder"
        fi
    done
    
    # Check for required variables
    required_vars=("POSTGRES_PASSWORD" "REDIS_PASSWORD" "ACCESS_TOKEN_SECRET")
    
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" "deployment-package/.env"; then
            print_success "$var is configured"
        else
            print_error "$var is missing"
        fi
    done
    
else
    print_error "Environment file not found"
fi

# Test 7: Docker configuration validation
print_header "Validating Docker Configuration"
if [ -f "deployment-package/docker-compose.yml" ]; then
    
    # Check for required services
    services=("postgres" "redis" "twenty-server" "twenty-front" "directory")
    
    for service in "${services[@]}"; do
        if grep -q "^  $service:" "deployment-package/docker-compose.yml"; then
            print_success "Service '$service' configured"
        else
            print_error "Service '$service' missing"
        fi
    done
    
    # Check for proper networking
    if grep -q "networks:" "deployment-package/docker-compose.yml"; then
        print_success "Docker networking configured"
    else
        print_warning "Docker networking may need configuration"
    fi
    
else
    print_error "Docker Compose file not found"
fi

# Test 8: Port availability check on droplet
print_header "Checking Target Port Availability"
target_ports=("3001" "3002" "3003")

for port in "${target_ports[@]}"; do
    if nc -z -w2 "$DROPLET_IP" "$port" 2>/dev/null; then
        print_warning "Port $port is already in use (may be from previous deployment)"
    else
        print_success "Port $port is available"
    fi
done

# Summary
print_header "Pre-Deployment Summary"

if [ -f "earthcare-deployment.tar.gz" ] && curl -s -f "http://${DROPLET_IP}:${DOKPLOY_PORT}" > /dev/null; then
    print_success "✅ Ready for deployment!"
    
    echo -e "\n${GREEN}Next Steps:${NC}"
    echo "1. Access Dokploy dashboard: http://${DROPLET_IP}:${DOKPLOY_PORT}"
    echo "2. Login with: arye@earthcare.network / KeepGoin!!!"
    echo "3. Create new application: earthcare-network"
    echo "4. Upload: earthcare-deployment.tar.gz"
    echo "5. Configure domains and SSL certificates"
    echo "6. Deploy and test services"
    
    echo -e "\n${BLUE}Deployment Package Ready:${NC}"
    echo "📦 Size: $(ls -lh earthcare-deployment.tar.gz | awk '{print $5}')"
    echo "📁 Location: $(pwd)/earthcare-deployment.tar.gz"
    
else
    print_error "❌ Not ready for deployment - fix issues above first"
    exit 1
fi

echo -e "\n🚀 EarthCare Network deployment verification complete!"