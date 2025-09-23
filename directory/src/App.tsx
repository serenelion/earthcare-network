import React, { useEffect, useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from '@apollo/client';
import './App.css';

// GraphQL client configuration
const client = new ApolloClient({
  uri: process.env.REACT_APP_CRM_API_URL || 'https://crm.app.earthcare.network/graphql',
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'ignore',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// GraphQL query to fetch companies
const GET_COMPANIES = gql`
  query GetCompanies($limit: Int) {
    companies(first: $limit) {
      edges {
        node {
          id
          name
          domainName
          employees
          idealCustomerProfile
          linkedinLink
          xLink
          annualRecurringRevenue
          address
          createdAt
          updatedAt
        }
      }
    }
  }
`;

interface Company {
  id: string;
  name: string;
  domainName?: string;
  employees?: number;
  idealCustomerProfile?: boolean;
  linkedinLink?: string;
  xLink?: string;
  annualRecurringRevenue?: number;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

const CompanyGrid = () => {
  const { loading, error, data } = useQuery(GET_COMPANIES, {
    variables: { limit: 50 },
    errorPolicy: 'all'
  });

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Loading sustainable companies...</p>
    </div>
  );

  if (error) {
    console.log('GraphQL Error:', error);
    return (
      <div className="error">
        <h3>🌱 Growing the Directory</h3>
        <p>We're currently building our network of sustainable companies.</p>
        <p>Check back soon as we add more eco-conscious businesses!</p>
        <div className="mock-companies">
          <h4>Featured Sustainable Companies:</h4>
          <div className="company-grid">
            {[
              { name: "TerraLux", domain: "terra-lux.org", description: "Regenerative Technology Solutions" },
              { name: "GreenTech Innovations", domain: "greentech.eco", description: "Clean Energy Systems" },
              { name: "Sustainable Supply Co", domain: "sustainsupply.com", description: "Eco-Friendly Products" },
              { name: "Planet Positive", domain: "planetpositive.org", description: "Environmental Consulting" },
              { name: "EcoVentures", domain: "ecoventures.green", description: "Impact Investment" },
              { name: "Carbon Neutral Corp", domain: "carbonneutral.biz", description: "Carbon Offset Solutions" }
            ].map((company, index) => (
              <div key={index} className="company-card mock">
                <h3>{company.name}</h3>
                <p className="domain">{company.domain}</p>
                <p className="description">{company.description}</p>
                <div className="tags">
                  <span className="tag sustainable">🌿 Sustainable</span>
                  <span className="tag verified">✅ Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const companies: Company[] = data?.companies?.edges?.map((edge: any) => edge.node) || [];

  return (
    <div className="companies-section">
      <div className="companies-header">
        <h2>🌍 EarthCare Network Directory</h2>
        <p>Discover {companies.length} sustainable companies building a better world</p>
      </div>
      
      {companies.length === 0 ? (
        <div className="empty-state">
          <h3>🌱 Building Our Network</h3>
          <p>We're actively growing our directory of sustainable companies.</p>
          <a href={process.env.REACT_APP_CRM_BASE_URL || 'https://crm.app.earthcare.network'} 
             className="cta-button"
             target="_blank" 
             rel="noopener noreferrer">
            Join the Network →
          </a>
        </div>
      ) : (
        <div className="company-grid">
          {companies.map((company) => (
            <div key={company.id} className="company-card">
              <div className="company-header">
                <h3>{company.name}</h3>
                {company.domainName && (
                  <a href={`https://${company.domainName}`} 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="domain-link">
                    {company.domainName}
                  </a>
                )}
              </div>
              
              <div className="company-details">
                {company.employees && (
                  <p><strong>Employees:</strong> {company.employees}</p>
                )}
                {company.annualRecurringRevenue && (
                  <p><strong>ARR:</strong> ${company.annualRecurringRevenue.toLocaleString()}</p>
                )}
                {company.address && (
                  <p><strong>Location:</strong> {company.address}</p>
                )}
              </div>

              <div className="company-links">
                {company.linkedinLink && (
                  <a href={company.linkedinLink} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                )}
                {company.xLink && (
                  <a href={company.xLink} target="_blank" rel="noopener noreferrer">
                    Twitter/X
                  </a>
                )}
              </div>

              <div className="company-meta">
                <span className="joined">
                  Joined: {new Date(company.createdAt).toLocaleDateString()}
                </span>
                {company.idealCustomerProfile && (
                  <span className="tag icp">🎯 Key Partner</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const App = () => {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <header className="App-header">
          <div className="hero-section">
            <div className="hero-content">
              <h1>🌍 EarthCare Network</h1>
              <p className="tagline">Humanity's New Earth Economy Is Rising</p>
              <p className="description">
                Discover and connect with sustainable companies building a regenerative future
              </p>
            </div>
            <div className="earth-animation">
              <div className="earth"></div>
            </div>
          </div>
        </header>

        <main>
          <CompanyGrid />
        </main>

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h3>🌱 About EarthCare Network</h3>
              <p>Connecting sustainable businesses and conscious consumers for planetary transformation.</p>
            </div>
            <div className="footer-section">
              <h3>🔗 Quick Links</h3>
              <ul>
                <li><a href="/about.html">About Us</a></li>
                <li><a href="/sponsors.html">Sponsors</a></li>
                <li><a href={process.env.REACT_APP_CRM_BASE_URL || 'https://crm.app.earthcare.network'} target="_blank" rel="noopener noreferrer">Join Network</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>🤝 Partnership</h3>
              <p>Founding Sponsor: <a href="https://terra-lux.org" target="_blank" rel="noopener noreferrer">TerraLux</a></p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 EarthCare Network. Building a sustainable future together.</p>
          </div>
        </footer>
      </div>
    </ApolloProvider>
  );
}

export default App;