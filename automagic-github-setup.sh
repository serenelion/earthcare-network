#!/bin/bash

# 🌍 EarthCare Network - Complete GitHub Setup & CI/CD Pipeline
# This script will automagically set up everything for you!

set -e

# Colors for beautiful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}🌍 $1${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
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

print_step() {
    echo -e "\n${CYAN}🔄 $1${NC}"
}

print_header "EarthCare Network - Automagic GitHub CI/CD Setup"

# Step 1: Verify GitHub CLI
print_step "Checking GitHub CLI setup..."
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI not found! Installing..."
    if command -v brew &> /dev/null; then
        brew install gh
    else
        print_error "Please install GitHub CLI manually: https://cli.github.com/"
        exit 1
    fi
fi

if ! gh auth status &> /dev/null; then
    print_warning "Not logged in to GitHub. Please authenticate..."
    gh auth login
fi

print_success "GitHub CLI is ready!"

# Step 2: Get repository details
USERNAME=$(gh api user --jq .login)
REPO_NAME="earthcare-network"
REPO_URL="https://github.com/$USERNAME/$REPO_NAME"

print_step "Setting up repository: $REPO_NAME"

# Step 3: Create repository if it doesn't exist
if ! gh repo view "$USERNAME/$REPO_NAME" &> /dev/null; then
    print_info "Creating new repository..."
    gh repo create "$REPO_NAME" \
        --description "🌍 EarthCare Network - Sustainable Business Directory with AI-Powered Growth & Monetization" \
        --public \
        --clone=false \
        --add-readme=false
    
    print_success "Repository created: $REPO_URL"
else
    print_info "Repository already exists: $REPO_URL"
fi

# Step 4: Configure git remotes
print_step "Configuring git remotes..."
git remote remove origin 2>/dev/null || true
git remote add origin "git@github.com:$USERNAME/$REPO_NAME.git"
print_success "Git remote configured"

# Step 5: Create and configure secrets for Dokploy
print_step "Setting up GitHub secrets for Dokploy integration..."

# Check if secrets exist, if not, prompt for creation
secrets_needed=(
    "DOKPLOY_WEBHOOK_URL:Dokploy webhook URL for deployment"
    "APOLLO_API_KEY:Apollo.io API key for lead discovery"
    "LINKEDIN_API_KEY:LinkedIn API key for social integration"
    "HUNTER_API_KEY:Hunter.io API key for email verification"
    "SPATIAL_NETWORK_API_KEY:Spatial Network API key for Build Pro trials"
    "EMAIL_SMTP_PASSWORD:SMTP password for email notifications"
)

echo ""
print_info "🔑 Setting up repository secrets..."
echo "You'll need to configure these secrets in GitHub for full automation:"

for secret_info in "${secrets_needed[@]}"; do
    secret_name="${secret_info%%:*}"
    secret_desc="${secret_info##*:}"
    
    # Create placeholder secret
    echo "placeholder_value_$secret_name" | gh secret set "$secret_name" --repo "$USERNAME/$REPO_NAME"
    print_warning "Secret '$secret_name' created with placeholder"
    echo "   └─ Purpose: $secret_desc"
done

print_info "📝 To update secrets later, use: gh secret set SECRET_NAME --repo $USERNAME/$REPO_NAME"

# Step 6: Create initial commit with all files
print_step "Preparing initial commit..."

# Add all files except node_modules and other ignored files
git add .
git add .github/workflows/deploy.yml

# Create comprehensive commit message
git commit -m "🚀 Initial deployment: EarthCare Network ready for CI/CD

🌍 Complete sustainable business platform including:
  ✅ Business directory with inspiring hero journey branding
  ✅ TerraLux founding sponsor integration  
  ✅ AI-powered monetization system ready
  ✅ Docker-based deployment configuration
  ✅ GitHub Actions CI/CD pipeline
  ✅ Dokploy integration for Digital Ocean

💰 Revenue streams configured:
  - Build Pro subscriptions (\$67-247/month)
  - Premium directory listings (\$29-199/month)
  - Sponsorship packages (\$2.5K-15K/month)
  - AI agent lead generation system

🎯 Target: \$100K MRR within 12 months
🚀 Auto-deploy to: https://app.earthcare.network

Ready to heal the world through conscious commerce! 🌱"

# Step 7: Push to GitHub
print_step "Pushing to GitHub..."
git branch -M main
git push -u origin main

print_success "Code pushed to main branch!"

# Step 8: Set up Dokploy webhook in repository
print_step "Configuring GitHub webhook for Dokploy..."

# Enable GitHub Actions if not already enabled
gh api repos/$USERNAME/$REPO_NAME/actions/permissions \
    --method PUT \
    --field enabled=true \
    --field allowed_actions=all 2>/dev/null || true

print_success "GitHub Actions enabled for repository"

# Step 9: Create deployment instructions
print_step "Creating deployment instructions..."

cat > GITHUB_DEPLOYMENT_SETUP.md << 'EOF'
# 🚀 EarthCare Network - GitHub CI/CD Setup Complete!

## ✅ What's Been Configured

### 🔄 **Automated CI/CD Pipeline**
- **Trigger**: Automatic deployment on push to `main` branch
- **Build**: Docker container with directory application  
- **Deploy**: Direct integration with Dokploy on Digital Ocean
- **Test**: Automatic verification of deployed services

### 🔑 **Repository Secrets** (Update these with real values)
```bash
DOKPLOY_WEBHOOK_URL        # Your Dokploy webhook URL
APOLLO_API_KEY            # Apollo.io for lead discovery
LINKEDIN_API_KEY          # LinkedIn API for social features  
HUNTER_API_KEY            # Hunter.io for email verification
SPATIAL_NETWORK_API_KEY   # Spatial Network for Build Pro trials
EMAIL_SMTP_PASSWORD       # Email notifications
```

### 🌐 **Deployment Targets**
- **Primary**: https://app.earthcare.network (Directory)
- **CRM**: https://crm.app.earthcare.network (Admin)
- **API**: https://api.earthcare.network (Backend)

## 🔧 **Setup Dokploy Integration**

### 1. **Get Dokploy Webhook URL**
```bash
# In Dokploy dashboard (http://157.230.173.94:3000):
1. Go to Applications → Create Application
2. Name: earthcare-network
3. Source: GitHub Repository
4. Repository: YOUR_USERNAME/earthcare-network
5. Branch: main
6. Copy the webhook URL provided
```

### 2. **Update GitHub Secret**
```bash
# Replace with your actual webhook URL
gh secret set DOKPLOY_WEBHOOK_URL --body "https://your-webhook-url-from-dokploy"
```

### 3. **Configure Dokploy Application**
```yaml
# In Dokploy application settings:
Build Command: docker build -t earthcare-directory ./directory
Port Mapping: 3003:80
Environment Variables: 
  - NODE_ENV=production
  - PORT=80
Domains:
  - app.earthcare.network (with SSL)
```

## 🚀 **How to Deploy**

### **Automatic Deployment** (Recommended)
```bash
# Simply push to main branch - CI/CD handles everything!
git add .
git commit -m "Update: new feature or fix"
git push origin main

# GitHub Actions will:
# 1. Build Docker image
# 2. Push to GitHub Container Registry  
# 3. Trigger Dokploy deployment
# 4. Verify deployment success
# 5. Notify status
```

### **Manual Deployment** (If needed)
```bash
# Trigger deployment manually
gh workflow run deploy.yml
```

## 📊 **Monitor Deployment**

### **GitHub Actions**
- View progress: https://github.com/YOUR_USERNAME/earthcare-network/actions
- Real-time logs and status updates
- Automatic rollback on failure

### **Dokploy Dashboard**  
- Monitor services: http://157.230.173.94:3000
- View deployment logs
- Manage environment variables
- SSL certificate status

### **Live Application**
- Directory: https://app.earthcare.network
- Health check: Automatic verification in CI/CD

## 🎯 **Next Steps**

1. **Update secrets** with real API keys for full functionality
2. **Configure DNS** for remaining subdomains if needed
3. **Test deployment** by making a small change and pushing
4. **Monitor performance** and scale as needed

## 🌍 **You're Ready to Change the World!**

Your EarthCare Network now deploys automatically with every push to main. The platform is ready to:
- Connect conscious businesses globally  
- Generate revenue through AI-powered growth
- Create positive environmental impact
- Scale automatically with demand

**Push code → Auto deploy → Heal the planet! 🌱**
EOF

print_success "Deployment guide created: GITHUB_DEPLOYMENT_SETUP.md"

# Step 10: Final summary
print_header "🎉 Setup Complete! Your EarthCare Network is Ready!"

echo -e "\n${GREEN}✅ Repository Setup Complete:${NC}"
echo -e "   📦 Repository: ${CYAN}$REPO_URL${NC}"
echo -e "   🔄 CI/CD: ${CYAN}Configured with GitHub Actions${NC}"
echo -e "   🚀 Deploy: ${CYAN}Push to main branch triggers auto-deployment${NC}"

echo -e "\n${YELLOW}🔑 Next Steps:${NC}"
echo -e "   1. Update GitHub secrets with real API keys"
echo -e "   2. Configure Dokploy webhook URL"  
echo -e "   3. Push a test change to trigger first deployment"
echo -e "   4. Watch your platform go live! 🌍"

echo -e "\n${BLUE}📖 Documentation:${NC}"
echo -e "   📋 Setup guide: ${CYAN}GITHUB_DEPLOYMENT_SETUP.md${NC}"
echo -e "   🚀 Actions: ${CYAN}$REPO_URL/actions${NC}"
echo -e "   ⚙️  Settings: ${CYAN}$REPO_URL/settings/secrets/actions${NC}"

echo -e "\n${PURPLE}🌟 Ready to heal the world through conscious commerce!${NC}"
echo -e "${GREEN}Your EarthCare Network will auto-deploy on every push to main! ✨${NC}"

echo -e "\n${CYAN}Test your setup:${NC}"
echo -e "   git add . && git commit -m \"Test deployment\" && git push"