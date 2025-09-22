# DNS Configuration for EarthCare Network

## Current Working Status ✅

### Working Domains:
- ✅ **Twenty CRM**: `https://crm.app.earthcare.network` - FULLY FUNCTIONAL
- ✅ **Directory Service**: Available via IP with Host header

### Current DNS Records:
```
Type: A Record
Name: *.app
Value: 157.230.173.94
Status: ✅ Working (covers crm.app.earthcare.network)
```

## Required DNS Fix 🔧

To make `app.earthcare.network` work directly, add this additional DNS record:

```
Type: A Record
Name: app
Value: 157.230.173.94
TTL: 300 (5 minutes)
```

**Note**: The wildcard `*.app` covers subdomains of `app` (like `crm.app.earthcare.network`) but NOT the `app` subdomain itself.

## Testing Commands:

### Test CRM (Working):
```bash
curl -I https://crm.app.earthcare.network
```

### Test Directory (Will work after DNS fix):
```bash
curl -I https://app.earthcare.network
```

### Test Directory via IP (Currently working):
```bash
curl -H "Host: app.earthcare.network" -k https://157.230.173.94
```

## Service Status ✅

All Docker services are running on the droplet:
- ✅ Traefik (Reverse Proxy)
- ✅ PostgreSQL + PostGIS
- ✅ Redis
- ✅ Twenty CRM
- ✅ EarthCare Directory (Nginx)
- ✅ SSL certificates auto-generated

## Complete Setup:

1. **Add DNS A record**: `app` → `157.230.173.94`
2. **Wait 5-15 minutes** for DNS propagation
3. **Test both applications**:
   - Admin CRM: https://crm.app.earthcare.network
   - Public Directory: https://app.earthcare.network