#!/bin/bash

# EarthCare Network GitHub Repository Setup Script
# This script will help you create and configure your own repository

set -e

echo "🌍 EarthCare Network - GitHub Repository Setup"
echo "=============================================="

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI is not installed. Please install it first:"
    echo "   brew install gh"
    echo "   OR download from: https://cli.github.com/"
    exit 1
fi

# Check if user is logged in to GitHub CLI
if ! gh auth status &> /dev/null; then
    echo "🔐 Please login to GitHub CLI first:"
    echo "   gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is ready"

# Create repository
REPO_NAME="earthcare-network"
REPO_DESCRIPTION="EarthCare Network - Sustainable Business Directory with AI-Powered Growth System"

echo "📦 Creating GitHub repository: $REPO_NAME"

# Create the repository
gh repo create "$REPO_NAME" \
    --description "$REPO_DESCRIPTION" \
    --public \
    --clone=false

echo "✅ Repository created: https://github.com/$(gh api user --jq .login)/$REPO_NAME"

# Remove old origin and add new one
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$(gh api user --jq .login)/$REPO_NAME.git"

echo "✅ Git remote updated to your new repository"

# Create main branch and push
git branch -M main
git add .
git commit -m "Initial commit: EarthCare Network deployment ready

🌍 Features included:
- Complete business directory with AI-powered growth
- Twenty CRM integration with custom modules
- AI Agent for lead discovery and email campaigns
- Business claiming workflow with Build Pro trials
- Multiple monetization streams
- Docker-based deployment configuration
- Comprehensive documentation and guides

Ready for CI/CD deployment to Digital Ocean via Dokploy!"

git push -u origin main

echo "✅ Code pushed to main branch"

echo ""
echo "🎉 GitHub repository setup complete!"
echo "Repository URL: https://github.com/$(gh api user --jq .login)/$REPO_NAME"
echo ""
echo "Next: Configure CI/CD pipeline and Dokploy integration"