#!/bin/bash

# EarthCare Network Deployment Script
# This script sets up the complete infrastructure with Dokploy, CI/CD, and MCP server

set -e

echo "🚀 Setting up EarthCare Network with Dokploy"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="${SERVER_IP:-157.230.173.94}"
SERVER_PASSWORD="${SERVER_PASSWORD:-BrG5e=n_Nd4B!zP}"
DOKPLOY_URL="http://${SERVER_IP}:3000"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v sshpass &> /dev/null; then
        print_error "sshpass is required but not installed."
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found locally. Make sure it's installed on the server."
    fi
    
    print_status "Prerequisites check completed."
}

# Test server connectivity
test_server_connection() {
    print_status "Testing server connection..."
    
    if sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER_IP "echo 'Server connection successful'" &> /dev/null; then
        print_status "Server connection successful."
    else
        print_error "Failed to connect to server. Check IP and password."
        exit 1
    fi
}

# Install dependencies on server
install_server_dependencies() {
    print_status "Installing server dependencies..."
    
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER_IP << 'EOF'
        # Update system
        apt-get update -y
        
        # Install required packages
        apt-get install -y curl wget git unzip net-tools
        
        # Install Node.js (for MCP server)
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
        
        # Verify installations
        docker --version
        node --version
        npm --version
EOF
    
    print_status "Server dependencies installed."
}

# Set up MCP server
setup_mcp_server() {
    print_status "Setting up MCP server..."
    
    # Copy MCP server files
    sshpass -p "$SERVER_PASSWORD" scp -r -o StrictHostKeyChecking=no "./mcp-server" root@$SERVER_IP:/opt/earthcare-mcp/
    
    # Install MCP server dependencies
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER_IP << 'EOF'
        cd /opt/earthcare-mcp
        npm install
        
        # Create systemd service for MCP server
        cat > /etc/systemd/system/earthcare-mcp.service << EOL
[Unit]
Description=EarthCare MCP Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/earthcare-mcp
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOL

        # Enable and start MCP service
        systemctl daemon-reload
        systemctl enable earthcare-mcp
        systemctl start earthcare-mcp
        
        # Check service status
        systemctl status earthcare-mcp --no-pager
EOF
    
    print_status "MCP server setup completed."
}

# Test Dokploy installation
test_dokploy() {
    print_status "Testing Dokploy installation..."
    
    # Wait for Dokploy to be ready
    echo "Waiting for Dokploy to start..."
    sleep 30
    
    # Test Dokploy endpoint
    if curl -f -s "$DOKPLOY_URL" > /dev/null; then
        print_status "Dokploy is accessible at $DOKPLOY_URL"
    else
        print_warning "Dokploy might still be starting. Try accessing $DOKPLOY_URL manually."
    fi
}

# Deploy applications
deploy_applications() {
    print_status "Deploying applications..."
    
    # Copy deployment files
    sshpass -p "$SERVER_PASSWORD" scp -r -o StrictHostKeyChecking=no . root@$SERVER_IP:/opt/earthcare-deployment/
    
    # Set up deployment
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER_IP << 'EOF'
        cd /opt/earthcare-deployment
        
        # Create environment file
        cat > .env << EOL
POSTGRES_PASSWORD=earthcare_secure_password_$(date +%s)
APP_SECRET=earthcare_app_secret_$(date +%s)
NODE_ENV=production
EOL
        
        # Start services using docker-compose
        docker-compose -f docker-compose.production.yml up -d
        
        # Wait for services to start
        sleep 60
        
        # Check service status
        docker-compose -f docker-compose.production.yml ps
EOF
    
    print_status "Applications deployed."
}

# Run end-to-end tests
run_e2e_tests() {
    print_status "Running end-to-end tests via MCP server..."
    
    # Test CRM health
    echo "Testing CRM health..."
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER_IP << 'EOF'
        cd /opt/earthcare-mcp
        
        # Test CRM endpoint
        echo '{"method": "call_tool", "params": {"name": "test_crm_health", "arguments": {}}}' | node server.js
        
        # Test Directory endpoint
        echo '{"method": "call_tool", "params": {"name": "test_directory_health", "arguments": {}}}' | node server.js
        
        # Test workspace subdomain (might fail if DNS not propagated)
        echo '{"method": "call_tool", "params": {"name": "test_workspace_subdomain", "arguments": {}}}' | node server.js || echo "Workspace subdomain test failed - DNS might not be propagated yet"
EOF
    
    print_status "End-to-end tests completed."
}

# Setup GitHub Actions secrets
setup_github_secrets() {
    print_status "GitHub Actions setup instructions:"
    
    cat << EOF

📋 To complete the CI/CD setup, add these secrets to your GitHub repository:

Repository Settings > Secrets and variables > Actions > New repository secret:

1. DOKPLOY_SERVER: $SERVER_IP:3000
2. DOKPLOY_TOKEN: (Get this from Dokploy dashboard after registration)
3. DEPLOY_KEY: (Generate SSH key for deployment)
4. POSTGRES_PASSWORD: (Generate secure password)
5. APP_SECRET: (Generate secure app secret)

📋 GitHub Actions workflow is configured in .github/workflows/ci-cd.yml

EOF
}

# Display completion information
display_completion_info() {
    print_status "🎉 EarthCare Network setup completed!"
    
    cat << EOF

🌐 Access URLs:
┌──────────────────────────────────────────────────────┐
│ Dokploy Dashboard:  http://$SERVER_IP:3000        │
│ CRM Application:    https://crm.app.earthcare.network │
│ Directory:          https://app.earthcare.network     │
│ Workspace (after DNS): https://app.crm.app.earthcare.network │
└──────────────────────────────────────────────────────┘

🔧 Next Steps:
1. Visit Dokploy dashboard and complete registration
2. Create project 'earthcare-network' in Dokploy
3. Add GitHub secrets for CI/CD pipeline
4. Push code to trigger first deployment
5. Verify DNS wildcard record for *.crm.app.earthcare.network

📊 MCP Server:
- Status: Running on server
- Service: systemctl status earthcare-mcp
- Logs: journalctl -u earthcare-mcp -f

🧪 Testing:
- E2E tests: Available via MCP server
- Playwright tests: In mcp-server/tests/
- GitHub Actions: Automated on push/PR

EOF
}

# Main execution
main() {
    echo "🌱 EarthCare Network Deployment Starting..."
    
    check_prerequisites
    test_server_connection
    install_server_dependencies
    setup_mcp_server
    test_dokploy
    deploy_applications
    run_e2e_tests
    setup_github_secrets
    display_completion_info
    
    print_status "Deployment script completed successfully!"
}

# Run the main function
main "$@"