const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'directory')));

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'earthcare',
  password: process.env.POSTGRES_PASSWORD || 'earthcare_secure_db_password_2024',
  port: 5432,
});

// API endpoint to get companies
app.get('/api/companies', async (req, res) => {
  try {
    console.log('Fetching companies from database...');
    
    // First, let's check what tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%company%'
      ORDER BY table_name;
    `);
    
    console.log('Available company tables:', tablesResult.rows);
    
    // Try to find company data in various possible table structures
    let companies = [];
    
    // Try different possible table names and structures
    const possibleQueries = [
      // Standard Twenty CRM structure
      `SELECT id, name, "domainName", address, employees, 
              "createdAt", "updatedAt",
              COALESCE(latitude, 0) as latitude, 
              COALESCE(longitude, 0) as longitude,
              COALESCE(category, 'general') as category,
              COALESCE(description, '') as description,
              COALESCE(claimed, false) as claimed,
              COALESCE(verified, false) as verified,
              COALESCE("pledgeSigned", false) as "pledgeSigned",
              COALESCE("logoUrl", '') as "logoUrl"
       FROM core.company 
       WHERE "deletedAt" IS NULL 
       LIMIT 50`,
      
      // Try metadata schema
      `SELECT id, name, "domainName", address, employees, 
              "createdAt", "updatedAt"
       FROM metadata.company 
       WHERE "deletedAt" IS NULL 
       LIMIT 50`,
       
      // Try public schema
      `SELECT id, name, "domainName", address, employees, 
              "createdAt", "updatedAt"
       FROM public.company 
       WHERE "deletedAt" IS NULL 
       LIMIT 50`,
    ];
    
    for (const query of possibleQueries) {
      try {
        const result = await pool.query(query);
        if (result.rows.length > 0) {
          companies = result.rows;
          console.log(`Found ${companies.length} companies using query`);
          break;
        }
      } catch (err) {
        console.log('Query failed, trying next...', err.message);
        continue;
      }
    }
    
    // If no real companies found, return sample data
    if (companies.length === 0) {
      console.log('No companies found in database, returning sample data');
      companies = [
        {
          id: '1',
          name: 'Green Valley Permaculture',
          address: 'Portland, Oregon',
          description: 'Sustainable farming and education center specializing in permaculture design.',
          category: 'permaculture',
          latitude: 45.5152,
          longitude: -122.6784,
          verified: true,
          claimed: true,
          pledgeSigned: true,
          logoUrl: '🌱'
        },
        {
          id: '2',
          name: 'EcoTech Solutions',
          address: 'Austin, Texas',
          description: 'Leading provider of solar panel installations and wind energy systems.',
          category: 'renewable-energy',
          latitude: 30.2672,
          longitude: -97.7431,
          verified: true,
          claimed: false,
          pledgeSigned: true,
          logoUrl: '☀️'
        }
      ];
    }
    
    res.json({
      success: true,
      count: companies.length,
      data: companies,
      source: companies.length > 2 ? 'database' : 'sample'
    });
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
});

// Serve the main directory page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'directory', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`EarthCare Directory API running on port ${port}`);
});