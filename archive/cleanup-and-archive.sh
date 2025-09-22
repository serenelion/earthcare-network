#!/bin/bash

# 🗑️ EarthCare Network - Cleanup & Archive Script
# This script moves all broken deployment files and junk code to an archive

echo "🧹 Starting EarthCare Network cleanup..."

# Create archive structure
mkdir -p archive/{deployment-docs,broken-configs,test-files,temp-files}

echo "📄 Moving deployment documentation..."
# Move all deployment-related documentation
mv AUTOMAGIC_DEPLOYMENT_GUIDE.md archive/deployment-docs/ 2>/dev/null || true
mv DEPLOYMENT_FIX_GUIDE.md archive/deployment-docs/ 2>/dev/null || true
mv DEPLOYMENT_READY_SUMMARY.md archive/deployment-docs/ 2>/dev/null || true
mv DEPLOYMENT_SUCCESS_REPORT.md archive/deployment-docs/ 2>/dev/null || true
mv DNS_CONFIGURATION.md archive/deployment-docs/ 2>/dev/null || true
mv DNS_SETUP_INSTRUCTIONS.md archive/deployment-docs/ 2>/dev/null || true
mv DOKPLOY_DEPLOYMENT_GUIDE.md archive/deployment-docs/ 2>/dev/null || true
mv EARTHCARE_FINAL_REPORT.md archive/deployment-docs/ 2>/dev/null || true
mv EARTHCARE_SUCCESS_REPORT.md archive/deployment-docs/ 2>/dev/null || true
mv EARTHCARE_TESTING.md archive/deployment-docs/ 2>/dev/null || true
mv END_TO_END_TEST_RESULTS.md archive/deployment-docs/ 2>/dev/null || true
mv IMPROVEMENT_ROADMAP.md archive/deployment-docs/ 2>/dev/null || true
mv INTEGRATION_SUCCESS_REPORT.md archive/deployment-docs/ 2>/dev/null || true
mv QUICK_WINS.md archive/deployment-docs/ 2>/dev/null || true

echo "📊 Moving business documentation..."
# Move business/strategy docs to separate folder
mkdir -p archive/business-docs
mv Earth-Enterprise-Directory-UX-Research-Report.md archive/business-docs/ 2>/dev/null || true
mv EARTHCARE_MONETIZATION_PLAYBOOK.md archive/business-docs/ 2>/dev/null || true
mv EarthCare-AI-Agent-PRD.md archive/business-docs/ 2>/dev/null || true
mv MONETIZATION_EXECUTION_CHECKLIST.md archive/business-docs/ 2>/dev/null || true
mv MONETIZATION_IMPLEMENTATION_GUIDE.md archive/business-docs/ 2>/dev/null || true
mv EARTHCARE_README.md archive/business-docs/ 2>/dev/null || true

echo "⚙️ Moving broken configurations..."
# Move broken/duplicate Docker configs
mv docker-compose.dokploy.yml archive/broken-configs/ 2>/dev/null || true
mv docker-compose.production.yml archive/broken-configs/ 2>/dev/null || true
mv docker-compose.simple.yml archive/broken-configs/ 2>/dev/null || true
mv Dockerfile.directory archive/broken-configs/ 2>/dev/null || true
mv Dockerfile.twenty archive/broken-configs/ 2>/dev/null || true
mv dokploy-config.yml archive/broken-configs/ 2>/dev/null || true
mv dokploy.yml archive/broken-configs/ 2>/dev/null || true

echo "🔧 Moving app configuration files..."
mv directory-app-config.json archive/broken-configs/ 2>/dev/null || true
mv postgres-config.json archive/broken-configs/ 2>/dev/null || true
mv project-config.json archive/broken-configs/ 2>/dev/null || true
mv redis-config.json archive/broken-configs/ 2>/dev/null || true
mv twenty-app-config.json archive/broken-configs/ 2>/dev/null || true

echo "🧪 Moving test files..."
mv test-magic.md archive/test-files/ 2>/dev/null || true
mv test_deployment.txt archive/test-files/ 2>/dev/null || true

echo "📁 Moving temporary directories..."
mv deployment-package archive/temp-files/ 2>/dev/null || true
mv acme-challenge archive/temp-files/ 2>/dev/null || true
mv temp-html archive/temp-files/ 2>/dev/null || true

echo "🗃️ Moving additional files..."
mv directory-api.js archive/broken-configs/ 2>/dev/null || true
mv nginx.conf archive/broken-configs/ 2>/dev/null || true
mv render.yaml archive/broken-configs/ 2>/dev/null || true
mv CLAUDE.md archive/deployment-docs/ 2>/dev/null || true

echo "✅ Cleanup complete! Files organized in archive/"

# Show what was archived
echo ""
echo "📊 Archive Summary:"
echo "==================="
echo "Deployment Docs: $(find archive/deployment-docs -type f | wc -l) files"
echo "Business Docs: $(find archive/business-docs -type f 2>/dev/null | wc -l) files"
echo "Broken Configs: $(find archive/broken-configs -type f | wc -l) files"
echo "Test Files: $(find archive/test-files -type f | wc -l) files"
echo "Temp Files: $(find archive/temp-files -type f -o -type d | wc -l) items"
echo ""
echo "🗑️ To delete entire archive: rm -rf archive/"
echo "📂 To review archive: ls -la archive/*/"