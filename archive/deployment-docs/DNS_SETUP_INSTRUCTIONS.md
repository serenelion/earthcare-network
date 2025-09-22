# DNS Setup Instructions for EarthCare Network

## Current Status ✅

- ✅ **CRM Fixed**: `https://crm.app.earthcare.network` - No more redirect issues!
- ✅ **Directory Working**: Available via IP, needs DNS record

## DNS Records Needed

### Current Working Record:
```
Type: A
Name: *.app  
Value: 157.230.173.94
Status: ✅ Working (covers crm.app.earthcare.network)
```

### Missing Record (ADD THIS):
```
Type: A
Name: app
Value: 157.230.173.94
TTL: 300
```

## Why Both Records Are Needed

- `*.app` covers subdomains like `crm.app.earthcare.network` 
- `app` covers the direct subdomain `app.earthcare.network`

## DNS Provider Instructions

### Most DNS Providers:
1. **Login to your DNS management panel**
2. **Add new A record**:
   - **Host/Name**: `app`
   - **Points to/Value**: `157.230.173.94`
   - **TTL**: `300` (5 minutes)
3. **Save changes**

### Alternative formats (depending on your provider):
- **Name**: `app.earthcare.network` (full domain)
- **Host**: `app` (subdomain only)
- **Record**: `A` 
- **Value/Target**: `157.230.173.94`

## Testing Commands

After adding the DNS record, test with:

```bash
# Test DNS resolution
nslookup app.earthcare.network

# Test HTTPS access  
curl -I https://app.earthcare.network

# Test CRM (should work now)
curl -I https://crm.app.earthcare.network
```

## Expected Timeline

- **DNS Propagation**: 5-15 minutes typically
- **SSL Certificate**: Automatic via Let's Encrypt (2-5 minutes after DNS)

## Verification

Once DNS propagates, both URLs should work:
- **CRM**: https://crm.app.earthcare.network ✅ (Fixed!)
- **Directory**: https://app.earthcare.network (After DNS)

The redirect issue has been resolved by correcting the Twenty CRM environment variables!