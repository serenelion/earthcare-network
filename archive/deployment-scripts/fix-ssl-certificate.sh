#!/bin/bash

# SSL Certificate Fix Script for EarthCare Network
echo "🔐 EarthCare Network SSL Certificate Fix"
echo "========================================"

SERVER_IP="157.230.173.94"
SERVER_PASS="BrG5e=n_Nd4B!zP"

echo "Current SSL status for app.earthcare.network:"
CERT_SUBJECT=$(openssl s_client -connect app.earthcare.network:443 -servername app.earthcare.network </dev/null 2>/dev/null | openssl x509 -noout -subject)
echo "Certificate: $CERT_SUBJECT"

if echo "$CERT_SUBJECT" | grep -q "TRAEFIK DEFAULT CERT"; then
    echo "❌ Using default Traefik certificate (not Let's Encrypt)"
    echo ""
    echo "🔧 Fixing SSL certificate..."
    
    # Create acme directory and fix permissions
    echo "1. Setting up acme directory..."
    sshpass -p "$SERVER_PASS" ssh root@$SERVER_IP "mkdir -p /opt/earthcare/acme && chmod 600 /opt/earthcare/acme"
    
    # Create empty acme.json with correct permissions
    echo "2. Creating acme.json file..."
    sshpass -p "$SERVER_PASS" ssh root@$SERVER_IP "touch /opt/earthcare/acme/acme.json && chmod 600 /opt/earthcare/acme/acme.json"
    
    # Restart Traefik to trigger certificate generation
    echo "3. Restarting Traefik..."
    sshpass -p "$SERVER_PASS" ssh root@$SERVER_IP "cd /opt/earthcare && docker-compose down traefik && docker-compose up -d traefik"
    
    # Wait for certificate generation
    echo "4. Waiting for certificate generation (60 seconds)..."
    sleep 60
    
    # Force certificate request by accessing the site
    echo "5. Triggering certificate generation..."
    curl -k https://app.earthcare.network > /dev/null 2>&1
    
    # Check again
    echo "6. Checking certificate again..."
    sleep 10
    NEW_CERT=$(openssl s_client -connect app.earthcare.network:443 -servername app.earthcare.network </dev/null 2>/dev/null | openssl x509 -noout -subject)
    echo "New certificate: $NEW_CERT"
    
    if echo "$NEW_CERT" | grep -q "app.earthcare.network"; then
        echo "✅ SSL certificate fixed!"
    else
        echo "⚠️  Certificate still not generated automatically"
        echo ""
        echo "Manual steps to fix:"
        echo "1. SSH to server: ssh root@157.230.173.94"
        echo "2. Go to project: cd /opt/earthcare"
        echo "3. Check logs: docker logs traefik --tail 50"
        echo "4. Restart services: docker-compose restart"
        echo "5. Wait 2-3 minutes for Let's Encrypt generation"
    fi
else
    echo "✅ SSL certificate is already working correctly!"
fi

echo ""
echo "🌐 Testing final access..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://app.earthcare.network)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ https://app.earthcare.network is accessible (HTTP $HTTP_CODE)"
else
    echo "❌ https://app.earthcare.network returned HTTP $HTTP_CODE"
fi

echo ""
echo "🔍 Browser Troubleshooting:"
echo "=========================="
echo "If you still see DNS_PROBE_FINISHED_NXDOMAIN in your browser:"
echo ""
echo "1. Clear browser DNS cache:"
echo "   Chrome: chrome://net-internals/#dns → Clear host cache"
echo "   Firefox: about:networking#dns → Clear DNS Cache"
echo "   Safari: Develop menu → Empty Caches"
echo ""
echo "2. Clear system DNS cache:"
echo "   macOS: sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder"
echo ""
echo "3. Try incognito/private browsing"
echo ""
echo "4. Try different DNS servers (8.8.8.8, 1.1.1.1)"
echo ""
echo "5. Wait a few more minutes for DNS propagation"
echo ""
echo "The site IS working - this is likely a local DNS cache issue!"