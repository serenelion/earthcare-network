# EarthCare Network - Business Directory Implementation

## Overview
A comprehensive business directory for regenerative businesses built on top of Twenty CRM, featuring geospatial visualization, business claiming workflows, and integration with the Spatial Network for enhanced capabilities.

## 🌍 Vision
EarthCare Network aims to connect regenerative businesses worldwide, creating a thriving ecosystem that supports sustainable practices and helps heal our planet.

## ✨ Features

### Core Features
- **🗺️ Geospatial Business Directory**: Interactive map showing regenerative businesses with PostGIS integration
- **🔍 Advanced Search & Filtering**: Search by name, category, location, and tags
- **🏢 Business Claiming System**: Email verification workflow for business owners
- **✅ Verification & Pledge System**: Verified businesses and EarthCare regenerative pledge
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **⚡ Real-time Updates**: Live data synchronization across the platform

### Technical Features
- **🎯 TypeScript**: Full type safety across frontend and backend
- **📊 GraphQL API**: Efficient data fetching with Twenty CRM's GraphQL layer
- **🗄️ PostgreSQL + PostGIS**: Geospatial database with advanced location queries
- **🎨 Styled Components**: Emotion-based styling with theme support
- **🔄 State Management**: Recoil for reactive state management
- **🧪 Component Library**: Reusable UI components with Storybook integration

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Emotion (Styled Components)
- **Backend**: Twenty CRM (NestJS + TypeScript) + GraphQL
- **Database**: PostgreSQL 16 with PostGIS extension
- **Maps**: MapLibre GL JS for interactive geospatial visualization
- **State**: Recoil for frontend state management
- **Deployment**: Docker + Dokploy → Digital Ocean

### Directory Structure
```
packages/twenty-server/src/modules/
├── business/                    # Business entity and resolvers
│   ├── standard-objects/
│   │   └── business.workspace-entity.ts
│   ├── resolvers/
│   │   └── business.resolver.ts
│   └── business.module.ts
├── category/                    # Business categories
│   ├── standard-objects/
│   │   └── category.workspace-entity.ts
│   ├── resolvers/
│   │   └── category.resolver.ts
│   └── category.module.ts
├── sponsor/                     # Sponsor management
│   ├── standard-objects/
│   │   ├── sponsor.workspace-entity.ts
│   │   └── sponsor-application.workspace-entity.ts
│   └── sponsor.module.ts
├── claim-token/                 # Business claiming system
│   ├── standard-objects/
│   │   └── claim-token.workspace-entity.ts
│   └── claim-token.module.ts
└── business-claim/              # Claim workflow service
    ├── services/
    │   └── business-claim.service.ts
    └── business-claim.module.ts

packages/twenty-front/src/modules/business-directory/
├── components/                  # React components
│   ├── BusinessCard.tsx         # Individual business display
│   ├── BusinessList.tsx         # Business grid/list view
│   ├── SearchBar.tsx           # Search with autocomplete
│   ├── CategoryFilter.tsx      # Category filtering
│   ├── ClaimModal.tsx          # Business claiming modal
│   └── MapView.tsx             # MapLibre GL integration
├── hooks/                      # Custom React hooks
│   ├── useBusinessDirectory.ts # Directory data management
│   └── useBusinessClaim.ts     # Claim workflow
├── pages/                      # Page components
│   ├── DirectoryPage.tsx       # Main public directory
│   └── AdminDashboard.tsx      # Admin management interface
└── index.ts                    # Module exports
```

## 📊 Database Schema

### Core Entities

#### Business Entity
```sql
-- Core business information with geospatial support
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  address JSONB,                    -- Address composite type
  latitude DECIMAL(10, 8),          -- Geospatial coordinates
  longitude DECIMAL(11, 8),
  phone VARCHAR(50),
  email VARCHAR(255),
  website JSONB,                    -- Links composite type
  category VARCHAR(100),            -- SELECT field with options
  tags TEXT[],                      -- MULTI_SELECT field
  pledge_signed BOOLEAN DEFAULT false,
  pledge_date TIMESTAMP,
  claimed BOOLEAN DEFAULT false,
  claimed_by UUID REFERENCES auth.users(id),
  claimed_date TIMESTAMP,
  verified BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  spatial_network_id UUID,          -- Integration with Build Pro
  logo_url TEXT,
  cover_image_url TEXT,
  business_hours JSONB,
  social_links JSONB,
  search_vector TSVECTOR,           -- Full-text search
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Geospatial index for efficient location queries
CREATE INDEX idx_businesses_location ON businesses USING GIST(
  ST_Point(longitude, latitude)
);
```

#### Category Entity
```sql
-- Hierarchical business categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(50),                 -- Emoji or icon identifier
  color VARCHAR(7),                 -- Hex color code
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  search_vector TSVECTOR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Claim Token Entity
```sql
-- Email verification for business claims
CREATE TABLE claim_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 API Endpoints

### GraphQL Queries
```graphql
# Get businesses with filtering and pagination
query GetBusinesses(
  $filter: BusinessFilterInput
  $first: Int = 20
  $after: String
) {
  businesses(filter: $filter, first: $first, after: $after) {
    edges {
      node {
        id
        name
        description
        category
        tags
        address {
          addressCity
          addressState
          addressCountry
        }
        verified
        claimed
        featured
        pledgeSigned
        latitude
        longitude
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}

# Get nearby businesses using geospatial query
query GetNearbyBusinesses(
  $latitude: Float!
  $longitude: Float!
  $radius: Float = 50
  $limit: Int = 20
) {
  nearbyBusinesses(
    latitude: $latitude
    longitude: $longitude
    radius: $radius
    limit: $limit
  ) {
    id
    name
    latitude
    longitude
    verified
    # Distance calculation included in ordering
  }
}

# Claim a business
mutation ClaimBusiness($input: ClaimBusinessInput!) {
  claimBusiness(input: $input) {
    success
    message
    token
  }
}
```

### REST API Endpoints
```typescript
// Public Directory API
GET    /api/businesses                 // List with filters
GET    /api/businesses/map             // Map view data
GET    /api/businesses/:slug           // Single business
POST   /api/businesses/claim           // Initiate claim
POST   /api/businesses/verify-claim    // Verify with token
GET    /api/categories                 // Categories with counts

// Admin CRM API (Twenty CRM integration)
GET    /api/admin/businesses           // CRM business view
PUT    /api/admin/businesses/:id       // Update business
GET    /api/admin/claims               // Pending claims
PUT    /api/admin/claims/:id/approve   // Approve claim
```

## 🎨 UI Components

### BusinessCard Component
```tsx
interface BusinessCardProps {
  business: {
    id: string;
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
    verified: boolean;
    claimed: boolean;
    featured: boolean;
    pledgeSigned: boolean;
    address?: AddressType;
  };
  view: 'grid' | 'list' | 'map';
  onClaim?: () => void;
  onViewDetails?: () => void;
}
```

### MapView Component with MapLibre GL
- Interactive business markers
- Popup details on click
- Geospatial clustering
- Custom styling and themes
- Mobile-optimized controls

### ClaimModal Workflow
1. Business selection
2. Owner information form
3. EarthCare pledge agreement
4. Email verification
5. Success confirmation with upgrade prompt

## 🔄 Business Claiming Workflow

### 1. Claim Initiation
```typescript
// User clicks "Claim Business" button
const claimData: ClaimFormData = {
  email: 'owner@business.com',
  ownerName: 'John Doe',
  position: 'Owner',
  phone: '+1-555-0123',
  message: 'I am the owner of this business...',
  agreeToPledge: true
};

await submitClaim(businessId, claimData);
```

### 2. Email Verification
- Secure token generation
- 24-hour expiry
- Email with verification link
- Token tracking and validation

### 3. Claim Completion
- Business marked as claimed
- Owner receives access
- Upgrade prompt to Build Pro
- Integration with Spatial Network

## 🌐 Geospatial Features

### PostGIS Integration
```sql
-- Radius search (find businesses within X km)
SELECT * FROM businesses 
WHERE ST_DWithin(
  ST_Point(longitude, latitude)::geography,
  ST_Point($user_lng, $user_lat)::geography,
  $radius_meters
);

-- Distance calculation for ordering
SELECT *, ST_Distance(
  ST_Point(longitude, latitude)::geography,
  ST_Point($user_lng, $user_lat)::geography
) as distance
FROM businesses
ORDER BY distance;
```

### MapLibre GL Features
- Custom business markers
- Popup information cards
- Clustering for dense areas
- Smooth zoom and pan
- Mobile-optimized gestures

## 🔧 Development Setup

### Prerequisites
- Node.js 24+
- Yarn 4+
- Docker & Docker Compose
- PostgreSQL 16 with PostGIS

### Installation
```bash
# Install dependencies
yarn install

# Start required services
make postgres-on-docker
make redis-on-docker

# Start the application
yarn start
```

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/earthcare
POSTGRES_DB=earthcare
POSTGRES_USER=earthcare
POSTGRES_PASSWORD=your_password

# Twenty CRM
TWENTY_API_URL=http://localhost:3000
SERVER_URL=http://localhost:3000

# Frontend
VITE_API_URL=http://localhost:3000
VITE_MAPLIBRE_API_KEY=your_maptiler_key

# Email (for claim verification)
RESEND_API_KEY=your_resend_key
FROM_EMAIL=noreply@earthcare.network

# Spatial Network Integration
SPATIAL_NETWORK_API_URL=https://api.thespatialnetwork.net
SPATIAL_NETWORK_API_KEY=your_api_key
```

## 🚀 Deployment

### Docker Compose for Dokploy
```yaml
version: '3.8'
services:
  postgres:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: earthcare
      POSTGRES_USER: earthcare
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  twenty-server:
    build: ./packages/twenty-server
    environment:
      DATABASE_URL: postgresql://earthcare:${DB_PASSWORD}@postgres:5432/earthcare
    depends_on:
      - postgres

  twenty-front:
    build: ./packages/twenty-front
    environment:
      VITE_API_URL: ${API_URL}
    ports:
      - "3000:3000"
```

## 🧪 Testing

### Component Testing
```bash
# Run component tests
yarn test

# Run with coverage
yarn test:coverage

# Run E2E tests
yarn test:e2e
```

### Test Scenarios
- Business directory browsing
- Search and filtering
- Business claiming workflow
- Map interaction
- Admin management

## 🎯 Roadmap

### Phase 1 - MVP ✅
- [x] Basic directory with map
- [x] Business claiming system
- [x] Admin interface
- [x] Search and filtering

### Phase 2 - Enhanced Features
- [ ] Advanced geospatial queries
- [ ] Business reviews and ratings
- [ ] Social sharing features
- [ ] Mobile app development

### Phase 3 - Community Features
- [ ] Business networking tools
- [ ] Event management
- [ ] Collaboration features
- [ ] Impact tracking

### Phase 4 - AI & Analytics
- [ ] AI-powered business recommendations
- [ ] Sustainability impact metrics
- [ ] Predictive analytics
- [ ] Automated content generation

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use Emotion for styling
3. Write comprehensive tests
4. Document GraphQL schemas
5. Follow Twenty CRM conventions

### Code Style
- ESLint + Prettier configuration
- Conventional commits
- Component-driven development
- Test-driven development

## 📜 License
AGPL-3.0 - Aligned with Twenty CRM's open-source license

## 🙏 Acknowledgments
- Twenty CRM team for the foundational platform
- PostGIS community for geospatial capabilities
- MapLibre GL JS for mapping functionality
- All contributors to the regenerative business movement

---

**Built with 🌱 for a regenerative future**

For questions or support, please reach out to the EarthCare Network team.