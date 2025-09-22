# 🚀 EarthCare Network - Dokploy Deployment Guide
## Complete Step-by-Step Deployment & Testing

---

## 📋 **Prerequisites Checklist**

- ✅ **Dokploy Instance**: Running at `157.230.173.94:3000`
- ✅ **Admin Access**: `arye@earthcare.network` / `KeepGoin!!!`
- ✅ **Deployment Package**: `earthcare-deployment.tar.gz` (117MB)
- ✅ **Domain Access**: Control over `earthcare.network` DNS
- ⏳ **DNS Configuration**: Required for SSL certificates

---

## 🔧 **Phase 1: Initial Deployment Setup**

### **Step 1: Access Dokploy Dashboard**

1. **Open browser** and navigate to: `http://157.230.173.94:3000`
2. **Login with credentials**:
   - Email: `arye@earthcare.network`
   - Password: `KeepGoin!!!`
3. **Verify dashboard access** - you should see the Dokploy management interface

### **Step 2: Create New Application**

1. **Click "Create Application"** (or "+ New Application")
2. **Configure basic settings**:
   - **Name**: `earthcare-network`
   - **Type**: `Docker Compose`
   - **Source**: `Upload`
3. **Upload deployment package**:
   - Select file: `earthcare-deployment.tar.gz`
   - Wait for upload completion (117MB may take 2-3 minutes)

### **Step 3: Configure Environment Variables**

Copy these variables from `.env.production` and update with real API keys:

```bash
# Database Configuration
POSTGRES_PASSWORD=EarthCare2024!SecureDB
REDIS_PASSWORD=EarthCare2024!SecureRedis

# Application Secrets
ACCESS_TOKEN_SECRET=earthcare_access_token_secret_2024_very_long_secure_string
REFRESH_TOKEN_SECRET=earthcare_refresh_token_secret_2024_very_long_secure_string
LOGIN_TOKEN_SECRET=earthcare_login_token_secret_2024_very_long_secure_string

# AI Agent API Keys (REPLACE WITH REAL KEYS)
APOLLO_API_KEY=your_apollo_api_key_here
LINKEDIN_API_KEY=your_linkedin_api_key_here
HUNTER_API_KEY=your_hunter_api_key_here

# Spatial Network Integration (REPLACE WITH REAL KEYS)
SPATIAL_NETWORK_API_KEY=your_spatial_network_api_key_here
SPATIAL_NETWORK_API_URL=https://api.spatialnetwork.io/v1

# Email Configuration (REPLACE WITH REAL SMTP)
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=no-reply@earthcare.network
EMAIL_SMTP_PASSWORD=your_email_password_here

# SSL Configuration
LETSENCRYPT_EMAIL=arye@earthcare.network
```

---

## 🌐 **Phase 2: DNS Configuration**

### **Step 4: Configure DNS Records**

Add these A records to your `earthcare.network` DNS:

```bash
# DNS Records Required
api.earthcare.network           A    157.230.173.94
crm.app.earthcare.network       A    157.230.173.94
app.earthcare.network           A    157.230.173.94

# Optional: Wildcard for future expansion
*.app.earthcare.network         A    157.230.173.94
```

### **Step 5: Configure Domain Routing in Dokploy**

1. **Navigate to application settings**
2. **Add domain configurations**:
   - **API Backend**: `api.earthcare.network` → Port `3001`
   - **CRM Frontend**: `crm.app.earthcare.network` → Port `3002`
   - **Directory**: `app.earthcare.network` → Port `3003`
3. **Enable SSL**: Dokploy will auto-generate Let's Encrypt certificates

---

## 🚢 **Phase 3: Application Deployment**

### **Step 6: Deploy Services**

1. **Click "Deploy" button** in Dokploy dashboard
2. **Monitor deployment logs**:
   - PostgreSQL database initialization
   - Redis cache startup
   - Twenty server build and startup
   - Twenty frontend build and startup
   - Directory service startup
3. **Wait for completion** (first deployment may take 5-10 minutes)

### **Step 7: Verify Service Health**

Check each service status in Dokploy:

```bash
# Expected Service Status
✅ postgres         - Running (Port 5432)
✅ redis           - Running (Port 6379)  
✅ twenty-server   - Running (Port 3001)
✅ twenty-front    - Running (Port 3002)
✅ directory       - Running (Port 3003)
```

---

## 🧪 **Phase 4: Testing & Verification**

### **Step 8: Basic Connectivity Tests**

Test each endpoint from your local machine:

```bash
# Test API Backend
curl -I https://api.earthcare.network
# Expected: HTTP/2 200 (or redirects are OK)

# Test CRM Frontend  
curl -I https://crm.app.earthcare.network
# Expected: HTTP/2 200

# Test Directory
curl -I https://app.earthcare.network  
# Expected: HTTP/2 200
```

### **Step 9: Functional Testing**

#### **Directory Testing:**
1. **Open**: `https://app.earthcare.network`
2. **Verify**: Landing page loads with hero section
3. **Test navigation**: Click "About" and "Sponsors" links
4. **Check features**: 
   - Earth animation works
   - Forms are interactive
   - TerraLux sponsor section displays correctly

#### **CRM Testing:**
1. **Open**: `https://crm.app.earthcare.network`
2. **Account setup**: Create initial admin account
3. **Database connection**: Verify Twenty CRM connects to PostgreSQL
4. **Test basic functionality**: Create a test company record

#### **API Testing:**
1. **Health check**: `curl https://api.earthcare.network/health`
2. **GraphQL endpoint**: `curl https://api.earthcare.network/graphql`
3. **Companies API**: Test if `/api/companies` endpoint responds

---

## ⚡ **Phase 5: Performance Optimization**

### **Step 10: Monitor Performance**

1. **Check service logs** in Dokploy dashboard
2. **Monitor resource usage**:
   - CPU usage should be <50% under normal load
   - Memory usage should be stable
   - No restart loops or error patterns
3. **Test load capacity**:
   - Simulate multiple concurrent users
   - Check response times (<2 seconds for all pages)

### **Step 11: SSL Certificate Verification**

```bash
# Check SSL certificate status
curl -vI https://app.earthcare.network 2>&1 | grep -i "ssl\|tls"
curl -vI https://crm.app.earthcare.network 2>&1 | grep -i "ssl\|tls"  
curl -vI https://api.earthcare.network 2>&1 | grep -i "ssl\|tls"

# All should show valid Let's Encrypt certificates
```

---

## 🔄 **Phase 6: Monetization System Testing**

### **Step 12: AI Agent Module Testing**

1. **Verify environment variables** are properly set
2. **Test lead discovery**:
   - Check if Apollo.io integration works
   - Verify email templates load correctly
   - Test business claiming workflow
3. **Monitor logs** for any API rate limit issues

### **Step 13: Business Claiming Workflow**

1. **Test claim form**: Submit a test business claim
2. **Verify email delivery**: Check verification email arrives
3. **Test verification process**: Complete 24-hour token workflow
4. **Spatial Network integration**: Verify Build Pro trial creation

### **Step 14: Revenue Stream Testing**

1. **Premium directory listings**: Test upgrade workflow
2. **Sponsorship display**: Verify TerraLux sponsor section
3. **Payment processing**: Test Stripe integration (if configured)
4. **Analytics tracking**: Verify conversion funnel metrics

---

## 🚨 **Troubleshooting Common Issues**

### **DNS Issues:**
```bash
# Check DNS propagation
dig api.earthcare.network
dig crm.app.earthcare.network
dig app.earthcare.network

# Should all return 157.230.173.94
```

### **SSL Certificate Issues:**
- Wait 5-10 minutes after DNS propagation
- Check Let's Encrypt rate limits
- Verify domain ownership in Dokploy

### **Service Connectivity Issues:**
- Check Dokploy service logs
- Verify environment variables are set correctly
- Restart services if needed

### **Database Connection Issues:**
- Verify PostgreSQL is running
- Check connection string format
- Ensure database credentials match

---

## 📊 **Success Metrics Dashboard**

### **Deployment Success Indicators:**

#### **✅ Infrastructure Health:**
- [ ] All 5 services running without errors
- [ ] SSL certificates valid for all domains
- [ ] Database connectivity established
- [ ] Redis cache operational

#### **✅ Application Functionality:**
- [ ] Directory loads with proper branding
- [ ] CRM admin panel accessible
- [ ] API endpoints responding correctly
- [ ] Navigation between pages works

#### **✅ Monetization Features:**
- [ ] Business claiming form functional
- [ ] Email verification system working
- [ ] Spatial Network integration active
- [ ] Sponsor display (TerraLux) correct

#### **✅ Performance Benchmarks:**
- [ ] Page load times <2 seconds
- [ ] No JavaScript errors in browser console
- [ ] Mobile responsive design working
- [ ] Search functionality operational

---

## 🎯 **Next Steps After Successful Deployment**

### **Immediate Actions:**
1. **Configure monitoring**: Set up uptime monitoring
2. **Backup strategy**: Configure database backups
3. **Security hardening**: Review firewall rules
4. **Performance monitoring**: Set up APM tools

### **API Key Setup:**
1. **Apollo.io**: Sign up and configure lead discovery
2. **LinkedIn Developer**: Set up API access
3. **Hunter.io**: Configure email verification
4. **Spatial Network**: Establish Build Pro integration

### **Marketing Launch:**
1. **Social media announcement**: Share new platform
2. **Email campaign**: Notify existing contacts
3. **SEO optimization**: Submit sitemaps
4. **Analytics setup**: Configure Google Analytics

---

## 🎉 **Deployment Complete!**

Once all tests pass, your EarthCare Network is live and ready to:

- **Discover and engage** 500+ sustainable businesses daily
- **Convert leads** through AI-powered personalization  
- **Generate revenue** via Build Pro subscriptions and sponsorships
- **Scale automatically** to handle growth and success

**🌍 Welcome to the new earth economy! Your platform is ready to heal the world through conscious commerce! ✨**

---

*For technical support or deployment issues, contact the development team or check Dokploy documentation.*