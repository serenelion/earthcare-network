import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { IconList, IconMap } from 'twenty-ui/display';
import { CategoryFilter } from '../components/CategoryFilter';
import { CompanyList } from '../components/CompanyList';
import { MapView } from '../components/MapView';
import { SearchBar } from '../components/SearchBar';

const StyledContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
`;

const StyledHeader = styled.div`
  margin-bottom: 48px;
  text-align: center;
`;

const StyledTitle = styled.h1`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  margin: 0 0 16px 0;
`;

const StyledSubtitle = styled.p`
  font-size: ${({ theme }) => theme.font.size.lg};
  color: ${({ theme }) => theme.font.color.secondary};
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const StyledFilters = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 32px;
`;

const StyledViewToggle = styled.div`
  display: flex;
  gap: 4px;
  margin-left: auto;
`;

const StyledViewButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  background: ${({ $active, theme }) =>
    $active ? theme.color.blue : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? 'white' : theme.font.color.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};

  &:hover {
    background: ${({ $active, theme }) =>
      $active ? theme.color.blue70 : theme.background.secondary};
  }

  &:first-of-type {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: none;
  }

  &:last-of-type {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`;

const StyledContent = styled.div`
  width: 100%;
`;

// Mock data for demonstration
const mockCompanies = [
  {
    id: '1',
    name: 'Green Valley Permaculture',
    description:
      'Sustainable farming and education center specializing in permaculture design and organic food production.',
    category: 'permaculture',
    tags: ['organic', 'education', 'farm-tours'],
    address: {
      addressCity: 'Portland',
      addressState: 'Oregon',
      addressCountry: 'USA',
    },
    latitude: 45.5152,
    longitude: -122.6784,
    verified: true,
    claimed: true,
    featured: true,
    pledgeSigned: true,
    logoUrl: '/images/green-valley-logo.jpg',
  },
  {
    id: '2',
    name: 'Renewable Energy Solutions',
    description:
      'Leading provider of solar panel installations and wind energy systems for residential and commercial properties.',
    category: 'renewable-energy',
    tags: ['consulting', 'manufacturing'],
    address: {
      addressCity: 'Austin',
      addressState: 'Texas',
      addressCountry: 'USA',
    },
    latitude: 30.2672,
    longitude: -97.7431,
    verified: true,
    claimed: false,
    featured: false,
    pledgeSigned: true,
  },
  {
    id: '3',
    name: 'EcoBuild Construction',
    description:
      'Sustainable construction company using natural building materials and passive house design principles.',
    category: 'eco-building',
    tags: ['consulting', 'services'],
    address: {
      addressCity: 'Boulder',
      addressState: 'Colorado',
      addressCountry: 'USA',
    },
    latitude: 40.015,
    longitude: -105.2705,
    verified: false,
    claimed: false,
    featured: false,
    pledgeSigned: false,
  },
];

export const CompanyDirectoryPage: React.FC = () => {
  const [companies, setCompanies] = useState(mockCompanies);
  const [filteredCompanies, setFilteredCompanies] = useState(mockCompanies);
  const [selectedView, setSelectedView] = useState<'list' | 'map'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedCompanyForClaim, setSelectedCompanyForClaim] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Filter companies based on search and category
  useEffect(() => {
    let filtered = companies;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (company) => company.category === selectedCategory,
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (company) =>
          company.name.toLowerCase().includes(query) ||
          company.description?.toLowerCase().includes(query) ||
          company.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    setFilteredCompanies(filtered);
  }, [companies, selectedCategory, searchQuery]);

  const handleClaim = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company && !company.claimed) {
      setSelectedCompanyForClaim({ id: company.id, name: company.name });
      setClaimModalOpen(true);
    }
  };

  const handleCloseClaimModal = () => {
    setClaimModalOpen(false);
    setSelectedCompanyForClaim(null);
  };

  const handleViewDetails = (companyId: string) => {
    console.log('Viewing company details:', companyId);
    // TODO: Navigate to company details page
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'permaculture', label: 'Permaculture' },
    { value: 'renewable-energy', label: 'Renewable Energy' },
    { value: 'eco-building', label: 'Eco-Building' },
    { value: 'organic-food', label: 'Organic Food' },
    { value: 'water-systems', label: 'Water Systems' },
    { value: 'community-gardens', label: 'Community Gardens' },
    { value: 'zero-waste', label: 'Zero Waste' },
    { value: 'alt-education', label: 'Alternative Education' },
  ];

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledTitle>EarthCare Network Directory</StyledTitle>
        <StyledSubtitle>
          Discover regenerative companies committed to healing our planet
          through sustainable practices and innovative solutions.
        </StyledSubtitle>
      </StyledHeader>

      <StyledFilters>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search companies, tags, or locations..."
        />

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <StyledViewToggle>
          <StyledViewButton
            $active={selectedView === 'list'}
            onClick={() => setSelectedView('list')}
          >
            <IconList size={16} />
            List
          </StyledViewButton>
          <StyledViewButton
            $active={selectedView === 'map'}
            onClick={() => setSelectedView('map')}
          >
            <IconMap size={16} />
            Map
          </StyledViewButton>
        </StyledViewToggle>
      </StyledFilters>

      <StyledContent>
        {selectedView === 'list' ? (
          <CompanyList
            companies={filteredCompanies}
            onCompanyClaim={handleClaim}
            onCompanyView={handleViewDetails}
            loading={loading}
          />
        ) : (
          <MapView
            companies={filteredCompanies}
            onCompanySelect={handleViewDetails}
            onCompanyClaim={handleClaim}
          />
        )}
      </StyledContent>
    </StyledContainer>
  );
};
