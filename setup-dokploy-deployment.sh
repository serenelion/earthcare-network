#!/bin/bash

# EarthCare Network - Complete Dokploy Deployment Setup
# This script configures Dokploy with our applications

set -e

SERVER_IP="157.230.173.94"
DOKPLOY_URL="http://${SERVER_IP}:3000"
ADMIN_EMAIL="arye@earthcare.network"
ADMIN_PASSWORD="KeepGoin!!!"

echo "🚀 Setting up EarthCare Network deployment on Dokploy..."

# Wait for Dokploy to be ready
echo "⏳ Waiting for Dokploy to be ready..."
for i in {1..30}; do
    if curl -s --max-time 5 "$DOKPLOY_URL" > /dev/null 2>&1; then
        echo "✅ Dokploy is ready!"
        break
    fi
    echo "   Attempt $i/30 - waiting 10 seconds..."
    sleep 10
done

# Create project configuration
echo "📁 Creating project configuration..."
cat > project-config.json << 'EOF'
{
  "name": "earthcare-network",
  "description": "EarthCare Network - Business Directory and CRM Platform",
  "repository": "https://github.com/aryeshabtai/earth-care-network.git"
}
EOF

# Create Twenty CRM application configuration
echo "🏢 Creating Twenty CRM configuration..."
cat > twenty-app-config.json << 'EOF'
{
  "name": "twenty-crm",
  "description": "Twenty CRM for EarthCare Network",
  "sourceType": "docker",
  "dockerImage": "twentyhq/twenty:latest",
  "domains": [
    "crm.app.earthcare.network",
    "app.crm.app.earthcare.network"
  ],
  "env": {
    "SERVER_URL": "https://crm.app.earthcare.network",
    "FRONT_BASE_URL": "https://crm.app.earthcare.network",
    "PG_DATABASE_URL": "postgres://twenty:${POSTGRES_PASSWORD}@postgres:5432/default",
    "REDIS_URL": "redis://redis:6379",
    "ACCESS_TOKEN_SECRET": "${APP_SECRET}",
    "LOGIN_TOKEN_SECRET": "${APP_SECRET}",
    "REFRESH_TOKEN_SECRET": "${APP_SECRET}",
    "FILE_TOKEN_SECRET": "${APP_SECRET}",
    "CORS_ALLOWED_ORIGINS": "https://crm.app.earthcare.network,https://app.crm.app.earthcare.network",
    "IS_SIGN_UP_DISABLED": "false",
    "SUPPORT_DRIVER": "none",
    "MESSAGE_QUEUE_TYPE": "redis"
  },
  "port": 3000,
  "healthCheck": "/healthz"
}
EOF

# Create Directory application configuration
echo "📋 Creating Directory configuration..."
cat > directory-app-config.json << 'EOF'
{
  "name": "earthcare-directory",
  "description": "EarthCare Business Directory",
  "sourceType": "docker",
  "dockerImage": "nginx:alpine",
  "domains": [
    "app.earthcare.network"
  ],
  "port": 80,
  "volumeMounts": [
    {
      "hostPath": "/opt/earthcare-deployment/directory",
      "containerPath": "/usr/share/nginx/html"
    }
  ]
}
EOF

# Create PostgreSQL service configuration
echo "🗄️ Creating PostgreSQL configuration..."
cat > postgres-config.json << 'EOF'
{
  "name": "earthcare-postgres",
  "description": "PostgreSQL database for EarthCare Network",
  "sourceType": "docker",
  "dockerImage": "postgis/postgis:15-3.3",
  "env": {
    "POSTGRES_DB": "default",
    "POSTGRES_USER": "twenty",
    "POSTGRES_PASSWORD": "${POSTGRES_PASSWORD}",
    "POSTGRES_HOST_AUTH_METHOD": "trust"
  },
  "port": 5432,
  "volumes": [
    {
      "name": "postgres-data",
      "mountPath": "/var/lib/postgresql/data"
    }
  ]
}
EOF

# Create Redis service configuration
echo "🔴 Creating Redis configuration..."
cat > redis-config.json << 'EOF'
{
  "name": "earthcare-redis",
  "description": "Redis cache for EarthCare Network",
  "sourceType": "docker",
  "dockerImage": "redis:7-alpine",
  "port": 6379,
  "volumes": [
    {
      "name": "redis-data",
      "mountPath": "/data"
    }
  ]
}
EOF

# Upload configurations to server
echo "📤 Uploading configurations to server..."
scp -o StrictHostKeyChecking=no *.json root@${SERVER_IP}:/opt/dokploy-configs/

# Create setup script for server
echo "📝 Creating server setup script..."
cat > server-setup.sh << 'EOF'
#!/bin/bash

# Generate secure passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
APP_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

echo "Generated passwords:"
echo "POSTGRES_PASSWORD: $POSTGRES_PASSWORD"
echo "APP_SECRET: $APP_SECRET"

# Create environment file
cat > /opt/dokploy-configs/.env << EOF
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
APP_SECRET=${APP_SECRET}
EOF

# Copy directory files if they don't exist
if [ ! -d "/opt/earthcare-deployment/directory" ]; then
    mkdir -p /opt/earthcare-deployment/directory
    cp -r /opt/earthcare-deployment/directory/* /opt/earthcare-deployment/directory/ 2>/dev/null || true
fi

echo "✅ Server configuration complete!"
EOF

# Upload and execute server setup
echo "🚀 Executing server setup..."
scp -o StrictHostKeyChecking=no server-setup.sh root@${SERVER_IP}:/tmp/
ssh -o StrictHostKeyChecking=no root@${SERVER_IP} "chmod +x /tmp/server-setup.sh && /tmp/server-setup.sh"

# Create MCP server deployment
echo "🧪 Setting up MCP testing server..."
cat > mcp-server-config.json << 'EOF'
{
  "name": "earthcare-mcp",
  "description": "MCP Server for end-to-end testing",
  "sourceType": "docker",
  "dockerImage": "node:18-alpine",
  "command": ["node", "/app/server.js"],
  "env": {
    "CRM_URL": "https://crm.app.earthcare.network",
    "DIRECTORY_URL": "https://app.earthcare.network"
  },
  "port": 8080,
  "volumeMounts": [
    {
      "hostPath": "/opt/earthcare-deployment/mcp-server",
      "containerPath": "/app"
    }
  ]
}
EOF

echo "📋 Configuration files created successfully!"
echo ""
echo "🌐 Next steps:"
echo "1. Open Dokploy dashboard: $DOKPLOY_URL"
echo "2. Login with:"
echo "   Email: $ADMIN_EMAIL"
echo "   Password: $ADMIN_PASSWORD"
echo "3. Create new project: earthcare-network"
echo "4. Add applications using the configuration files created"
echo ""
echo "💡 Configuration files location on server: /opt/dokploy-configs/"
echo ""
echo "🔍 To monitor deployment:"
echo "   ssh root@$SERVER_IP 'docker service ls'"
echo ""

# Test connectivity
echo "🧪 Testing server connectivity..."
if curl -s --max-time 10 "$DOKPLOY_URL" > /dev/null; then
    echo "✅ Dokploy dashboard is accessible at $DOKPLOY_URL"
else
    echo "⚠️  Dokploy dashboard not yet accessible - may need a few more minutes"
fi

echo ""
echo "🎉 Dokploy setup script completed!"
echo "📖 Use the MCP server to test the deployment after setup:"
echo "   curl http://$SERVER_IP:8080/test-all"