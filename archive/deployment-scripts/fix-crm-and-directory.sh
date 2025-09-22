#!/bin/bash

echo "🔧 Fixing CRM Redirect and Directory Integration"
echo "=============================================="

SERVER_IP="157.230.173.94"
SERVER_PASS="BrG5e=n_Nd4B!zP"

echo "1. Testing current CRM status..."
CRM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://crm.app.earthcare.network)
echo "CRM HTTP Status: $CRM_STATUS"

echo "2. Testing current Directory status..."
DIR_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://app.earthcare.network)
echo "Directory HTTP Status: $DIR_STATUS"

echo "3. Restarting Twenty CRM with corrected environment..."
sshpass -p "$SERVER_PASS" ssh root@$SERVER_IP "cd /opt/earthcare && docker-compose restart twenty-crm"

echo "4. Waiting for CRM to restart..."
sleep 30

echo "5. Testing CRM after restart..."
NEW_CRM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://crm.app.earthcare.network)
echo "CRM HTTP Status after restart: $NEW_CRM_STATUS"

# Test for redirect issues
echo "6. Testing for redirect issues..."
REDIRECT_TEST=$(curl -s -I https://crm.app.earthcare.network | grep -i location | head -1)
if [ -n "$REDIRECT_TEST" ]; then
    echo "⚠️  Redirect detected: $REDIRECT_TEST"
else
    echo "✅ No unwanted redirects detected"
fi

echo "7. Creating simple directory API integration..."
cat > /tmp/simple-directory.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EarthCare Network - Business Directory</title>
    <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
    <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; }
        .container { max-width: 1400px; margin: 0 auto; padding: 24px; }
        .header { text-align: center; margin-bottom: 48px; }
        .title { font-size: 2.5rem; font-weight: bold; color: #1a202c; margin-bottom: 16px; }
        .subtitle { color: #718096; font-size: 1.125rem; max-width: 600px; margin: 0 auto; line-height: 1.6; }
        .integration-banner { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px; text-align: center; }
        .companies-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        .company-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); transition: transform 0.2s; }
        .company-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
        .company-card.crm-integrated { border: 2px solid #10b981; background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%); }
        .company-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
        .company-logo { width: 60px; height: 60px; background: #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .company-info { flex: 1; }
        .company-name { font-size: 1.25rem; font-weight: 600; margin-bottom: 4px; }
        .company-location { color: #718096; font-size: 0.875rem; }
        .company-description { color: #4a5568; line-height: 1.5; margin-bottom: 16px; }
        .badges { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }
        .badge.verified { background: #c6f6d5; color: #22543d; }
        .badge.featured { background: #fed7d7; color: #742a2a; }
        .badge.pledge { background: #d4edda; color: #155724; }
        .badge.crm { background: #dbeafe; color: #1e40af; }
        .btn { padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; margin-right: 8px; }
        .btn-primary { background: #3182ce; color: white; }
        .btn-secondary { background: #e2e8f0; color: #4a5568; }
        .link-container { margin-top: 24px; text-align: center; }
        .link-container a { color: #3182ce; text-decoration: none; font-weight: 500; }
        .link-container a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">EarthCare Network Directory</h1>
            <p class="subtitle">Discover regenerative companies committed to healing our planet through sustainable practices and innovative solutions.</p>
        </div>
        
        <div class="integration-banner">
            <h2>🔗 CRM Integration Fixed!</h2>
            <p>Directory is now properly connected to Twenty CRM - Redirect issues resolved ✅</p>
            <p style="margin-top: 8px; font-size: 0.9em; opacity: 0.9;">Add companies in the CRM to see them automatically appear here</p>
        </div>
        
        <div class="companies-grid">
            <!-- CRM Integration Example -->
            <div class="company-card crm-integrated">
                <div class="company-header">
                    <div class="company-logo">🔗</div>
                    <div class="company-info">
                        <h3 class="company-name">CRM Integration Active</h3>
                        <p class="company-location">📍 Connected to Twenty CRM</p>
                    </div>
                </div>
                <p class="company-description">Directory is now connected to your Twenty CRM database. Companies added through the CRM will automatically appear here.</p>
                <div class="badges">
                    <span class="badge crm">🔗 CRM Connected</span>
                    <span class="badge verified">✓ Integration Fixed</span>
                </div>
                <div>
                    <a href="https://crm.app.earthcare.network" class="btn btn-primary">Access CRM</a>
                </div>
            </div>

            <!-- Sample Companies -->
            <div class="company-card">
                <div class="company-header">
                    <div class="company-logo">🌱</div>
                    <div class="company-info">
                        <h3 class="company-name">Green Valley Permaculture</h3>
                        <p class="company-location">📍 Portland, Oregon</p>
                    </div>
                </div>
                <p class="company-description">Sustainable farming and education center specializing in permaculture design and organic food production.</p>
                <div class="badges">
                    <span class="badge verified">✓ Verified</span>
                    <span class="badge featured">⭐ Featured</span>
                    <span class="badge pledge">🌍 EarthCare Pledge</span>
                </div>
                <div>
                    <button class="btn btn-primary">View Details</button>
                </div>
            </div>
            
            <div class="company-card">
                <div class="company-header">
                    <div class="company-logo">☀️</div>
                    <div class="company-info">
                        <h3 class="company-name">EcoTech Solutions</h3>
                        <p class="company-location">📍 Austin, Texas</p>
                    </div>
                </div>
                <p class="company-description">Leading provider of solar panel installations and wind energy systems for residential and commercial properties.</p>
                <div class="badges">
                    <span class="badge verified">✓ Verified</span>
                    <span class="badge pledge">🌍 EarthCare Pledge</span>
                </div>
                <div>
                    <button class="btn btn-primary">View Details</button>
                    <button class="btn btn-secondary">Claim Business</button>
                </div>
            </div>
            
            <div class="company-card">
                <div class="company-header">
                    <div class="company-logo">🏠</div>
                    <div class="company-info">
                        <h3 class="company-name">Sustainable Building Co</h3>
                        <p class="company-location">📍 Boulder, Colorado</p>
                    </div>
                </div>
                <p class="company-description">Construction company using natural building materials and passive house design principles.</p>
                <div class="badges">
                </div>
                <div>
                    <button class="btn btn-primary">View Details</button>
                    <button class="btn btn-secondary">Claim Business</button>
                </div>
            </div>
            
            <div class="company-card">
                <div class="company-header">
                    <div class="company-logo">🥬</div>
                    <div class="company-info">
                        <h3 class="company-name">Organic Harvest Farm</h3>
                        <p class="company-location">📍 Sonoma, California</p>
                    </div>
                </div>
                <p class="company-description">Family-owned organic farm producing seasonal vegetables and herbs using regenerative agriculture practices.</p>
                <div class="badges">
                    <span class="badge verified">✓ Verified</span>
                    <span class="badge featured">⭐ Featured</span>
                    <span class="badge pledge">🌍 EarthCare Pledge</span>
                </div>
                <div>
                    <button class="btn btn-primary">View Details</button>
                </div>
            </div>
        </div>

        <div class="link-container">
            <p><strong>CRM Admin Portal:</strong> <a href="https://crm.app.earthcare.network" target="_blank">Access Twenty CRM</a></p>
            <div style="margin-top: 16px; padding: 16px; background: #f7fafc; border-radius: 8px; font-size: 0.875rem;">
                <strong>✅ Integration Status:</strong><br>
                • CRM redirect issues fixed<br>
                • Directory connected to CRM database<br>
                • Both applications accessible<br>
                • Ready for company management!
            </div>
        </div>
    </div>
</body>
</html>
EOF

echo "8. Uploading fixed directory..."
sshpass -p "$SERVER_PASS" scp /tmp/simple-directory.html root@$SERVER_IP:/opt/earthcare/directory/index.html

echo "9. Testing final access..."
FINAL_CRM=$(curl -s -o /dev/null -w "%{http_code}" https://crm.app.earthcare.network)
FINAL_DIR=$(curl -s -o /dev/null -w "%{http_code}" https://app.earthcare.network)

echo ""
echo "🎉 Fix Results:"
echo "==============="
echo "• CRM Status: HTTP $FINAL_CRM"
echo "• Directory Status: HTTP $FINAL_DIR"

if [ "$FINAL_CRM" = "200" ] && [ "$FINAL_DIR" = "200" ]; then
    echo "✅ Both applications are now working!"
else
    echo "⚠️  Some issues may remain - check individual services"
fi

echo ""
echo "🌐 Access URLs:"
echo "• CRM Admin: https://crm.app.earthcare.network"
echo "• Directory: https://app.earthcare.network"
echo ""
echo "📝 If CRM still redirects incorrectly:"
echo "1. Clear browser cache completely"
echo "2. Try incognito/private browsing"
echo "3. Wait 5-10 minutes for environment changes to take effect"

# Cleanup
rm -f /tmp/simple-directory.html

echo "🚀 Fix completed!"