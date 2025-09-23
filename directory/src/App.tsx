import { ApolloClient, ApolloProvider, gql, InMemoryCache, useQuery } from '@apollo/client';
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

// GraphQL query to fetch companies - updated for Twenty CRM structure
const GET_COMPANIES = gql`
  query GetCompanies($limit: Int) {
    objects(first: $limit, filter: { objectMetadataId: { eq: "company" } }) {
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

// Sample sustainable companies data for fallback
const SAMPLE_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'TerraLux',
    domainName: 'terra-lux.org',
    employees: 45,
    idealCustomerProfile: true,
    linkedinLink: 'https://linkedin.com/company/terra-lux',
    xLink: 'https://x.com/terra_lux',
    annualRecurringRevenue: 2500000,
    address: 'San Francisco, CA',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'GreenTech Innovations',
    domainName: 'greentech.eco',
    employees: 120,
    idealCustomerProfile: true,
    linkedinLink: 'https://linkedin.com/company/greentech-innovations',
    annualRecurringRevenue: 8500000,
    address: 'Austin, TX',
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2024-02-20T00:00:00Z'
  },
  {
    id: '3',
    name: 'Sustainable Supply Co',
    domainName: 'sustainsupply.com',
    employees: 78,
    idealCustomerProfile: false,
    linkedinLink: 'https://linkedin.com/company/sustainable-supply',
    annualRecurringRevenue: 3200000,
    address: 'Portland, OR',
    createdAt: '2024-03-10T00:00:00Z',
    updatedAt: '2024-03-10T00:00:00Z'
  },
  {
    id: '4',
    name: 'Planet Positive',
    domainName: 'planetpositive.org',
    employees: 25,
    idealCustomerProfile: true,
    linkedinLink: 'https://linkedin.com/company/planet-positive',
    xLink: 'https://x.com/planetpositive',
    annualRecurringRevenue: 1200000,
    address: 'Boulder, CO',
    createdAt: '2024-04-05T00:00:00Z',
    updatedAt: '2024-04-05T00:00:00Z'
  },
  {
    id: '5',
    name: 'EcoVentures',
    domainName: 'ecoventures.green',
    employees: 15,
    idealCustomerProfile: false,
    linkedinLink: 'https://linkedin.com/company/ecoventures',
    annualRecurringRevenue: 800000,
    address: 'Seattle, WA',
    createdAt: '2024-05-12T00:00:00Z',
    updatedAt: '2024-05-12T00:00:00Z'
  },
  {
    id: '6',
    name: 'Carbon Neutral Corp',
    domainName: 'carbonneutral.biz',
    employees: 200,
    idealCustomerProfile: true,
    linkedinLink: 'https://linkedin.com/company/carbon-neutral-corp',
    xLink: 'https://x.com/carbonneutral',
    annualRecurringRevenue: 15000000,
    address: 'New York, NY',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z'
  }
];

const CompanyGrid = () => {
  const { loading, error, data } = useQuery(GET_COMPANIES, {
    variables: { limit: 50 },
    errorPolicy: 'all'
  });

  // Use sample data as fallback when API is not available
  const companies: Company[] = data?.objects?.edges?.map((edge: any) => edge.node) || SAMPLE_COMPANIES;

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Loading sustainable companies...</p>
    </div>
  );

  return (
    <div className="companies-section">
      <div className="companies-header">
        <h2>🌍 EarthCare Network Directory</h2>
        <p>Discover {companies.length} sustainable companies building a better world</p>
        {error && (
          <div className="api-notice">
            <p>📡 Showing sample data - CRM integration in progress</p>
          </div>
        )}
      </div>
      
      <div className="company-grid">
        {companies.map((company) => (
          <div key={company.id} className="company-card">
            <div className="company-header">
              <div className="company-logo">
                <div className="logo-placeholder">
                  {company.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="company-info">
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
            </div>
            
            <div className="company-details">
              {company.employees && (
                <div className="detail-item">
                  <span className="detail-icon">👥</span>
                  <span className="detail-label">Team Size:</span>
                  <span className="detail-value">{company.employees.toLocaleString()}</span>
                </div>
              )}
              {company.annualRecurringRevenue && (
                <div className="detail-item">
                  <span className="detail-icon">💰</span>
                  <span className="detail-label">ARR:</span>
                  <span className="detail-value">${(company.annualRecurringRevenue / 1000000).toFixed(1)}M</span>
                </div>
              )}
              {company.address && (
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{company.address}</span>
                </div>
              )}
            </div>

            <div className="company-links">
              {company.linkedinLink && (
                <a href={company.linkedinLink} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                  <span className="social-icon">💼</span>
                  LinkedIn
                </a>
              )}
              {company.xLink && (
                <a href={company.xLink} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                  <span className="social-icon">🐦</span>
                  Twitter/X
                </a>
              )}
            </div>

            <div className="company-meta">
              <div className="company-tags">
                <span className="tag sustainable">🌿 Sustainable</span>
                <span className="tag verified">✅ Verified</span>
                {company.idealCustomerProfile && (
                  <span className="tag icp">🎯 Key Partner</span>
                )}
              </div>
              <span className="joined">
                Joined {new Date(company.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
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
              <div className="brand-section">
                <div className="spatial-network-badge">
                  <span className="badge-text">Powered by</span>
                  <a href="https://thespatialnetwork.net" target="_blank" rel="noopener noreferrer" className="spatial-link">
                    The Spatial Network
                  </a>
                </div>
                <h1>🌍 EarthCare Network</h1>
                <p className="tagline">Humanity's New Earth Economy Is Rising</p>
                <p className="description">
                  Discover and connect with sustainable companies building a regenerative future. 
                  Join the ecoluxury movement transforming our planet.
                </p>
                <div className="hero-stats">
                  <div className="stat">
                    <span className="stat-number">6+</span>
                    <span className="stat-label">Companies</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">$30M+</span>
                    <span className="stat-label">Combined ARR</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">500+</span>
                    <span className="stat-label">Employees</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="spatial-grid">
                <div className="grid-line horizontal"></div>
                <div className="grid-line vertical"></div>
                <div className="floating-elements">
                  <div className="element element-1">🌱</div>
                  <div className="element element-2">♻️</div>
                  <div className="element element-3">🌿</div>
                  <div className="element element-4">🌍</div>
                  <div className="element element-5">⚡</div>
                  <div className="element element-6">💚</div>
                </div>
              </div>
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
              <p>Connecting sustainable businesses and conscious consumers for planetary transformation. 
                 Part of The Spatial Network's ecoluxury ecosystem.</p>
            </div>
            <div className="footer-section">
              <h3>🔗 Quick Links</h3>
              <ul>
                <li><a href="/about.html">About Us</a></li>
                <li><a href="/sponsors.html">Sponsors</a></li>
                <li><a href={process.env.REACT_APP_CRM_BASE_URL || 'https://crm.app.earthcare.network'} target="_blank" rel="noopener noreferrer">Join Network</a></li>
                <li><a href="https://thespatialnetwork.net" target="_blank" rel="noopener noreferrer">The Spatial Network</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>🤝 Partnership</h3>
              <p>Founding Sponsor: <a href="https://terra-lux.org" target="_blank" rel="noopener noreferrer">TerraLux</a></p>
              <p>Powered by: <a href="https://thespatialnetwork.net" target="_blank" rel="noopener noreferrer">The Spatial Network</a></p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 EarthCare Network. Building a sustainable future together.</p>
            <p className="spatial-credit">Part of The Spatial Network's ecoluxury ecosystem</p>
          </div>
        </footer>
      </div>
    </ApolloProvider>
  );
}

export default App;