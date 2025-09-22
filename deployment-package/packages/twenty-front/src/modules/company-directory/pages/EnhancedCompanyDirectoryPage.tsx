import styled from '@emotion/styled';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { IconList, IconMap, IconFilter, IconSearch } from 'twenty-ui/display';
import { EnhancedMapView } from '../components/EnhancedMapView';
import { CompanyList } from '../components/CompanyList';

// Map-first layout with 70% map, 30% sidebar
const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${({ theme }) => theme.background.primary};
`;

const StyledHeader = styled.header`
  background: ${({ theme }) => theme.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const StyledHeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  gap: 24px;
`;

const StyledBrand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  h1 {
    font-size: ${({ theme }) => theme.font.size.xl};
    font-weight: ${({ theme }) => theme.font.weight.bold};
    color: ${({ theme }) => theme.font.color.primary};
    margin: 0;
  }
  
  .logo {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #059669, #10b981);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
  }
`;

const StyledSearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 600px;
`;

const StyledSearchInput = styled.input`
  width: 100%;
  padding: 12px 48px 12px 16px;
  border: 2px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.lg};
  font-size: ${({ theme }) => theme.font.size.md};
  background: ${({ theme }) => theme.background.secondary};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.blue};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.color.blue}20;
    background: ${({ theme }) => theme.background.primary};
  }
`;

const StyledMainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const StyledSidebar = styled.div<{ $collapsed: boolean }>`
  width: ${({ $collapsed }) => $collapsed ? '0' : '30%'};
  background: ${({ theme }) => theme.background.primary};
  border-right: 1px solid ${({ theme }) => theme.border.color.light};
  overflow: hidden;
  transition: width 0.3s ease;
`;

const StyledMapArea = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

const StyledFiltersBar = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  padding: 12px 24px;
  display: flex;
  gap: 12px;
  overflow-x: auto;
`;

const StyledFilterChip = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.border.radius.pill};
  font-size: ${({ theme }) => theme.font.size.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  border: 1px solid;
  
  ${({ $active, theme }) => {
    if ($active) {
      return `
        background: ${theme.color.blue};
        color: white;
        border-color: ${theme.color.blue};
      `;
    }
    return `
      background: ${theme.background.primary};
      color: ${theme.font.color.secondary};
      border-color: ${theme.border.color.medium};
    `;
  }}
`;

const StyledBusinessCount = styled.div`
  padding: 16px 24px;
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  background: ${({ theme }) => theme.background.secondary};
`;

// Mock sustainable companies data
const mockSustainableCompanies = [
  {
    id: '1',
    name: 'Green Valley Permaculture',
    description: 'Regenerative farming and education center with carbon sequestration focus.',
    category: 'permaculture',
    tags: ['organic', 'education', 'carbon-sequestration'],
    address: { addressCity: 'Portland', addressState: 'Oregon', addressCountry: 'USA' },
    latitude: 45.5152,
    longitude: -122.6784,
    verified: true,
    claimed: true,
    featured: true,
    pledgeSigned: true,
  },
  {
    id: '2',
    name: 'Solar Innovations Inc',
    description: 'B-Corp certified solar installation for residential and commercial properties.',
    category: 'renewable-energy',
    tags: ['solar', 'b-corp', 'residential', 'commercial'],
    address: { addressCity: 'Austin', addressState: 'Texas', addressCountry: 'USA' },
    latitude: 30.2672,
    longitude: -97.7431,
    verified: true,
    claimed: true,
    pledgeSigned: true,
  },
  {
    id: '3',
    name: 'EcoBuild Collective',
    description: 'Worker-owned cooperative specializing in natural building materials.',
    category: 'eco-building',
    tags: ['cooperative', 'natural-building', 'passive-house'],
    address: { addressCity: 'Boulder', addressState: 'Colorado', addressCountry: 'USA' },
    latitude: 40.015,
    longitude: -105.2705,
    verified: true,
    pledgeSigned: true,
  },
];

const sustainabilityCategories = [
  { value: 'all', label: 'All Categories', icon: '🌍' },
  { value: 'renewable-energy', label: 'Renewable Energy', icon: '⚡' },
  { value: 'permaculture', label: 'Permaculture', icon: '🌿' },
  { value: 'organic-food', label: 'Organic Food', icon: '🌱' },
  { value: 'eco-building', label: 'Eco Building', icon: '🏗️' },
  { value: 'water-systems', label: 'Water Systems', icon: '💧' },
];

export const EnhancedCompanyDirectoryPage: React.FC = () => {
  const [companies] = useState(mockSustainableCompanies);
  const [selectedView, setSelectedView] = useState<'list' | 'map'>('map'); // Map-first!
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [verified, setVerified] = useState(false);
  const [pledgeSigned, setPledgeSigned] = useState(false);

  // Filter companies with sustainability focus
  const filteredCompanies = useMemo(() => {
    let filtered = companies;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(company => company.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(query) ||
        company.description?.toLowerCase().includes(query) ||
        company.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (verified) {
      filtered = filtered.filter(company => company.verified);
    }

    if (pledgeSigned) {
      filtered = filtered.filter(company => company.pledgeSigned);
    }

    // Sort by sustainability score
    return filtered.sort((a, b) => {
      const scoreA = (a.verified ? 40 : 0) + (a.pledgeSigned ? 30 : 0) + (a.featured ? 20 : 0);
      const scoreB = (b.verified ? 40 : 0) + (b.pledgeSigned ? 30 : 0) + (b.featured ? 20 : 0);
      return scoreB - scoreA;
    });
  }, [companies, searchQuery, selectedCategory, verified, pledgeSigned]);

  const handleCompanyClaim = useCallback((companyId: string) => {
    console.log('Claiming company:', companyId);
    // TODO: Integrate with Twenty CRM
  }, []);

  const handleCompanySelect = useCallback((companyId: string) => {
    console.log('Selecting company:', companyId);
  }, []);

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledHeaderContent>
          <StyledBrand>
            <div className=\"logo\">🌍</div>
            <h1>EarthCare Network</h1>
          </StyledBrand>
          
          <StyledSearchContainer>
            <StyledSearchInput
              type=\"text\"
              placeholder=\"Search sustainable businesses, practices, certifications...\"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </StyledSearchContainer>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'transparent' }}>
              Add Business
            </button>
            <button style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white' }}>
              Sign In
            </button>
          </div>
        </StyledHeaderContent>
      </StyledHeader>
      
      <StyledFiltersBar>
        {sustainabilityCategories.map(category => (
          <StyledFilterChip
            key={category.value}
            $active={selectedCategory === category.value}
            onClick={() => setSelectedCategory(category.value)}
          >
            {category.icon} {category.label}
          </StyledFilterChip>
        ))}
        
        <StyledFilterChip
          $active={verified}
          onClick={() => setVerified(!verified)}
        >
          ✓ Verified Only
        </StyledFilterChip>
        
        <StyledFilterChip
          $active={pledgeSigned}
          onClick={() => setPledgeSigned(!pledgeSigned)}
        >
          🌱 Climate Pledge
        </StyledFilterChip>
      </StyledFiltersBar>
      
      <StyledMainContent>
        <StyledSidebar $collapsed={sidebarCollapsed}>
          <StyledBusinessCount>
            📍 {filteredCompanies.length} sustainable businesses found
          </StyledBusinessCount>
          
          <CompanyList
            companies={filteredCompanies}
            onCompanyClaim={handleCompanyClaim}
            onCompanyView={handleCompanySelect}
            loading={false}
          />
        </StyledSidebar>
        
        <StyledMapArea>
          <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, display: 'flex', background: 'white', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <button
              style={{
                padding: '8px 12px',
                border: 'none',
                background: selectedView === 'map' ? '#3b82f6' : 'transparent',
                color: selectedView === 'map' ? 'white' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onClick={() => setSelectedView('map')}
            >
              <IconMap size={16} /> Map
            </button>
            <button
              style={{
                padding: '8px 12px',
                border: 'none',
                background: selectedView === 'list' ? '#3b82f6' : 'transparent',
                color: selectedView === 'list' ? 'white' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onClick={() => {
                setSelectedView('list');
                setSidebarCollapsed(false);
              }}
            >
              <IconList size={16} /> List
            </button>
          </div>
          
          {selectedView === 'map' ? (
            <EnhancedMapView
              companies={filteredCompanies}
              onCompanySelect={handleCompanySelect}
              onCompanyClaim={handleCompanyClaim}
              showClusters={true}
            />
          ) : (
            <div style={{ padding: '24px' }}>
              <CompanyList
                companies={filteredCompanies}
                onCompanyClaim={handleCompanyClaim}
                onCompanyView={handleCompanySelect}
                loading={false}
              />
            </div>
          )}
        </StyledMapArea>
      </StyledMainContent>
    </StyledContainer>
  );
};"