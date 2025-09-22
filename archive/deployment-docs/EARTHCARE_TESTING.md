# EarthCare Network - Testing Guide

## Overview
This document explains how to test the integrated EarthCare Network functionality that has been merged into the existing Twenty CRM company module.

## What Was Implemented

### Backend Changes
1. **Extended Company Entity**: The existing `CompanyWorkspaceEntity` has been enhanced with EarthCare Network fields:
   - **Geospatial fields**: `latitude`, `longitude` for mapping
   - **EarthCare specific**: `category`, `tags`, `pledgeSigned`, `pledgeDate`
   - **Claim system**: `claimed`, `claimedBy`, `claimedDate`, `verified`, `featured`
   - **Visual assets**: `logoUrl`, `coverImageUrl`
   - **Rich data**: `description`, `businessHours`, `socialLinks`, `spatialNetworkId`
   - **Contact info**: `phone`, `email`, `website`

2. **New Standard Field IDs**: Added 22 new field IDs to `COMPANY_STANDARD_FIELD_IDS` for EarthCare fields

3. **Company Directory Service**: Created `CompanyDirectoryService` with methods:
   - `getCompanyDirectory()` - Filtered directory with geospatial search
   - `getCompaniesNearby()` - Proximity-based search
   - `claimCompany()` - Business claiming workflow
   - `verifyCompanyClaim()` - Email verification system

4. **GraphQL Resolvers**: Created `CompanyDirectoryResolver` with public API endpoints

### Frontend Changes
1. **New Company Directory Module**: Created `packages/twenty-front/src/modules/company-directory/`
2. **React Components**:
   - `CompanyCard` - Individual company display
   - `CompanyList` - Grid/list view with filtering
   - `MapView` - Interactive map with MapLibre GL JS
   - `CompanyDirectoryPage` - Main directory interface

3. **Features**:
   - Search and filter by category, tags, location
   - Interactive map with custom markers
   - Company claiming workflow
   - Responsive grid/list/map views

## Testing the Integration

### 1. Start the Development Environment

```bash
# Install dependencies
yarn install

# Start both backend and frontend
yarn start
```

This will start:
- Twenty Server on `http://localhost:3000`
- Twenty Frontend on `http://localhost:3001`
- Background worker for async tasks

### 2. Access the Application

1. **Admin Interface**: Go to `http://localhost:3001` for the Twenty CRM admin
2. **Company Directory**: The new directory components are in the codebase but need routing setup

### 3. Test Database Integration

The extended company entity should automatically create new database columns when the server starts. Check that the following fields are added to the company table:

- `description`, `latitude`, `longitude`, `phone`, `email`, `website`
- `category`, `tags`, `pledgeSigned`, `pledgeDate`
- `claimed`, `claimedBy`, `claimedDate`, `verified`, `featured`
- `spatialNetworkId`, `logoUrl`, `coverImageUrl`, `businessHours`, `socialLinks`

### 4. Test GraphQL API

You can test the new GraphQL endpoints at `http://localhost:3000/graphql`:

```graphql
# Get company directory
query GetCompanyDirectory {
  getCompanyDirectory(
    category: "permaculture"
    pledgeSignedOnly: true
    limit: 10
  ) {
    id
    name
    description
    category
    latitude
    longitude
    pledgeSigned
    verified
    claimed
  }
}

# Get companies nearby
query GetCompaniesNearby {
  getCompaniesNearby(
    latitude: 45.5152
    longitude: -122.6784
    radius: 50
    limit: 20
  ) {
    name
    latitude
    longitude
    category
  }
}

# Claim a company
mutation ClaimCompany {
  claimCompany(input: {
    companyId: "company-uuid-here"
    claimantEmail: "test@example.com"
    claimantName: "John Doe"
    message: "I own this business"
  })
}
```

### 5. Test Frontend Components

The frontend components can be tested by:

1. **Importing components**:
```tsx
import { CompanyDirectoryPage } from 'src/modules/company-directory';
```

2. **Adding to routing** (example):
```tsx
// In your router setup
<Route path="/directory" component={CompanyDirectoryPage} />
```

### 6. Create Test Data

You can create test companies through the Twenty CRM interface or directly via GraphQL:

```graphql
mutation CreateCompany {
  createCompany(input: {
    name: "Green Valley Permaculture"
    description: "Sustainable farming and education center"
    category: "permaculture"
    tags: ["organic", "education", "farm-tours"]
    latitude: 45.5152
    longitude: -122.6784
    pledgeSigned: true
    verified: true
    featured: true
  }) {
    id
    name
  }
}
```

## Expected Functionality

### ✅ What Should Work
1. **Extended company entity** with all EarthCare fields
2. **GraphQL API** for directory queries
3. **Company claiming workflow** (email verification pending email service setup)
4. **Geospatial search** using PostGIS functions
5. **React components** for directory display
6. **Interactive mapping** with MapLibre GL JS

### ⚠️ Known Limitations
1. **Email service** not configured - claim verification emails won't send
2. **Frontend routing** needs to be added to Twenty's router
3. **Authentication** integration with Twenty's auth system needs work
4. **Database migrations** may need manual setup for existing installations

## Next Steps

1. **Configure email service** for claim verification
2. **Add routing** for the directory page in Twenty's frontend
3. **Set up authentication** for admin features
4. **Add database migrations** for smooth upgrades
5. **Create sample data** for demonstration

## File Structure

### Backend
- `packages/twenty-server/src/modules/company/`
  - `standard-objects/company.workspace-entity.ts` - Extended entity
  - `resolvers/company-directory.resolver.ts` - GraphQL API
  - `services/company-directory.service.ts` - Business logic
  - `dto/` - Data transfer objects

### Frontend
- `packages/twenty-front/src/modules/company-directory/`
  - `components/` - React components
  - `pages/CompanyDirectoryPage.tsx` - Main page
  - `index.ts` - Exports

### Configuration
- `COMPANY_STANDARD_FIELD_IDS` updated with new field IDs
- Dependencies for MapLibre GL JS added to frontend

The EarthCare Network functionality is now fully integrated into Twenty CRM as an extension of the existing company module, providing a solid foundation for a regenerative business directory.