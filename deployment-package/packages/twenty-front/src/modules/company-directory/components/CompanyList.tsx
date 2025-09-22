import React, { useState } from 'react';
import styled from '@emotion/styled';
import { CompanyCard, type CompanyCardProps } from './CompanyCard';
import { IconList, IconGrid } from 'twenty-ui/display';

export interface CompanyListProps {
  companies: CompanyCardProps['company'][];
  view?: 'grid' | 'list';
  onCompanyClaim?: (companyId: string) => void;
  onCompanyView?: (companyId: string) => void;
  loading?: boolean;
}

const StyledContainer = styled.div`
  width: 100%;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
`;

const StyledTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledCount = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  margin-left: 8px;
`;

const StyledViewToggle = styled.div`
  display: flex;
  gap: 4px;
`;

const StyledViewButton = styled.button<{ $active: boolean }>`
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  background: ${({ $active, theme }) => $active ? theme.color.blue : 'transparent'};
  color: ${({ $active, theme }) => $active ? 'white' : theme.font.color.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ $active, theme }) => $active ? theme.color.blue70 : theme.background.secondary};
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

const StyledGrid = styled.div<{ $view: 'grid' | 'list' }>`
  display: ${({ $view }) => $view === 'grid' ? 'grid' : 'flex'};
  flex-direction: ${({ $view }) => $view === 'list' ? 'column' : 'unset'};
  grid-template-columns: ${({ $view }) => $view === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : 'unset'};
  gap: ${({ $view }) => $view === 'grid' ? '24px' : '0'};
`;

const StyledEmptyState = styled.div`
  text-align: center;
  padding: 64px 24px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledEmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const StyledEmptyTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledEmptyDescription = styled.p`
  font-size: ${({ theme }) => theme.font.size.sm};
  margin: 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
`;

const StyledLoadingGrid = styled.div<{ $view: 'grid' | 'list' }>`
  display: ${({ $view }) => $view === 'grid' ? 'grid' : 'flex'};
  flex-direction: ${({ $view }) => $view === 'list' ? 'column' : 'unset'};
  grid-template-columns: ${({ $view }) => $view === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : 'unset'};
  gap: ${({ $view }) => $view === 'grid' ? '24px' : '0'};
`;

const StyledLoadingCard = styled.div<{ $view: 'grid' | 'list' }>`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  overflow: hidden;
  animation: pulse 1.5s ease-in-out infinite;

  ${({ $view }) => $view === 'list' && `
    display: flex;
    align-items: center;
    padding: 16px;
    border-radius: 0;
    border-bottom: 1px solid;
  `}

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const StyledLoadingSkeleton = styled.div<{ 
  width?: string; 
  height?: string;
  $view: 'grid' | 'list';
}>`
  background: ${({ theme }) => theme.background.secondary};
  width: ${({ width }) => width || '100%'};
  height: ${({ height, $view }) => height || ($view === 'list' ? '64px' : '192px')};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

const StyledLoadingContent = styled.div<{ $view: 'grid' | 'list' }>`
  padding: ${({ $view }) => $view === 'list' ? '0 16px' : '16px'};
  flex: ${({ $view }) => $view === 'list' ? '1' : 'none'};
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  view = 'grid',
  onCompanyClaim,
  onCompanyView,
  loading = false,
}) => {
  const [currentView, setCurrentView] = useState<'grid' | 'list'>(view);

  const handleClaim = (companyId: string) => {
    onCompanyClaim?.(companyId);
  };

  const handleView = (companyId: string) => {
    onCompanyView?.(companyId);
  };

  const renderLoadingState = () => (
    <StyledLoadingGrid $view={currentView}>
      {Array.from({ length: currentView === 'grid' ? 6 : 8 }).map((_, index) => (
        <StyledLoadingCard key={index} $view={currentView}>
          <StyledLoadingSkeleton $view={currentView} />
          <StyledLoadingContent $view={currentView}>
            <StyledLoadingSkeleton width="70%" height="24px" $view={currentView} />
            <StyledLoadingSkeleton width="100%" height="16px" $view={currentView} />
            <StyledLoadingSkeleton width="40%" height="16px" $view={currentView} />
          </StyledLoadingContent>
        </StyledLoadingCard>
      ))}
    </StyledLoadingGrid>
  );

  const renderEmptyState = () => (
    <StyledEmptyState>
      <StyledEmptyIcon>🌱</StyledEmptyIcon>
      <StyledEmptyTitle>No companies found</StyledEmptyTitle>
      <StyledEmptyDescription>
        We couldn't find any regenerative companies matching your criteria. 
        Try adjusting your filters or search terms.
      </StyledEmptyDescription>
    </StyledEmptyState>
  );

  return (
    <StyledContainer>
      <StyledHeader>
        <div>
          <StyledTitle>
            Regenerative Companies
            <StyledCount>
              {loading ? '...' : `${companies.length} compan${companies.length !== 1 ? 'ies' : 'y'}`}
            </StyledCount>
          </StyledTitle>
        </div>
        <StyledViewToggle>
          <StyledViewButton
            $active={currentView === 'grid'}
            onClick={() => setCurrentView('grid')}
            title="Grid view"
          >
            <IconGrid size={16} />
          </StyledViewButton>
          <StyledViewButton
            $active={currentView === 'list'}
            onClick={() => setCurrentView('list')}
            title="List view"
          >
            <IconList size={16} />
          </StyledViewButton>
        </StyledViewToggle>
      </StyledHeader>

      {loading ? (
        renderLoadingState()
      ) : companies.length === 0 ? (
        renderEmptyState()
      ) : (
        <StyledGrid $view={currentView}>
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              view={currentView}
              onClaim={() => handleClaim(company.id)}
              onViewDetails={() => handleView(company.id)}
            />
          ))}
        </StyledGrid>
      )}
    </StyledContainer>
  );
};