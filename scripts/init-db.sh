#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable PostGIS extension
    CREATE EXTENSION IF NOT EXISTS postgis;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Create initial tables for EarthCare Network
    CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        website VARCHAR(255),
        address TEXT,
        description TEXT,
        category VARCHAR(100),
        is_verified BOOLEAN DEFAULT false,
        is_featured BOOLEAN DEFAULT false,
        location GEOMETRY(POINT, 4326),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create index for geospatial queries
    CREATE INDEX IF NOT EXISTS idx_companies_location ON companies USING GIST (location);
    
    -- Insert sample companies
    INSERT INTO companies (name, email, category, address, description, is_verified, is_featured, location) VALUES
    ('Green Valley Farm', 'contact@greenvalleyfarm.com', 'permaculture', '123 Green Valley Rd, Austin, TX', 'Regenerative agriculture and permaculture design', true, true, ST_SetSRID(ST_MakePoint(-97.7431, 30.2672), 4326)),
    ('Solar Solutions LLC', 'info@solarsolutions.com', 'renewable-energy', '456 Solar Way, Denver, CO', 'Residential and commercial solar installations', true, false, ST_SetSRID(ST_MakePoint(-104.9903, 39.7392), 4326)),
    ('EcoBuilders', 'hello@ecobuilders.com', 'eco-building', '789 Sustainable St, Portland, OR', 'Sustainable building and green construction', true, true, ST_SetSRID(ST_MakePoint(-122.6750, 45.5152), 4326))
    ON CONFLICT DO NOTHING;
    
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
EOSQL
