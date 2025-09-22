import React from 'react';
import styled from '@emotion/styled';
import { IconBuilding, IconCheck, IconMapPin, IconCertificate } from 'twenty-ui/display';

export interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
    address?: {
      addressStreet1?: string;
      addressCity?: string;
      addressState?: string;
      addressCountry?: string;
    };
    logoUrl?: string;
    verified: boolean;
    claimed: boolean;
    featured: boolean;
    pledgeSigned: boolean;
    latitude?: number;
    longitude?: number;
  };
  view: 'grid' | 'list' | 'map';
  onClaim?: () => void;
  onViewDetails?: () => void;
}

const StyledCard = styled.div<{ $view: 'grid' | 'list' | 'map' }>`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  overflow: hidden;
  transition: box-shadow 0.2s ease;
  background: ${({ theme }) => theme.background.primary};

  &:hover {
    box-shadow: ${({ theme }) => theme.boxShadow.light};
  }

  ${({ $view }) => $view === 'list' && `
    display: flex;
    align-items: center;
    padding: 16px;
    border-radius: 0;
    border-bottom: 1px solid;
  `}
`;

const StyledImage = styled.img<{ $view: 'grid' | 'list' | 'map' }>`
  width: ${({ $view }) => $view === 'list' ? '64px' : '100%'};
  height: ${({ $view }) => $view === 'list' ? '64px' : '192px'};
  object-fit: cover;
  border-radius: ${({ $view, theme }) => $view === 'list' ? theme.border.radius.sm : '0'};
`;

const StyledContent = styled.div<{ $view: 'grid' | 'list' | 'map' }>`
  padding: ${({ $view }) => $view === 'list' ? '0 16px' : '16px'};
  flex: ${({ $view }) => $view === 'list' ? '1' : 'none'};
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const StyledTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledBadges = styled.div`
  display: flex;
  gap: 4px;
`;

const StyledBadge = styled.span<{ $color: string }>`
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background: ${({ $color }) => {
    switch ($color) {
      case 'green': return '#dcfce7';
      case 'blue': return '#dbeafe';
      case 'purple': return '#f3e8ff';
      default: return '#f3f4f6';
    }
  }};
  color: ${({ $color }) => {
    switch ($color) {
      case 'green': return '#166534';
      case 'blue': return '#1e40af';
      case 'purple': return '#7c3aed';
      default: return '#374151';
    }
  }};
`;

const StyledDescription = styled.p`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  margin: 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StyledTags = styled.div`
  display: flex;
  gap: 4px;
  margin: 8px 0;
  flex-wrap: wrap;
`;

const StyledTag = styled.span`
  font-size: ${({ theme }) => theme.font.size.xs};
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background: ${({ theme }) => theme.background.secondary};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const StyledButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;

  ${({ $variant, theme }) => $variant === 'primary' ? `
    background: ${theme.color.blue};
    border-color: ${theme.color.blue};
    color: white;

    &:hover {
      background: ${theme.color.blue70};
      border-color: ${theme.color.blue70};
    }
  ` : `
    background: transparent;
    border-color: ${theme.border.color.medium};
    color: ${theme.font.color.primary};

    &:hover {
      background: ${theme.background.secondary};
    }
  `}
`;

const StyledAddress = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
`;

export const CompanyCard: React.FC<CompanyCardProps> = ({ 
  company, 
  view, 
  onClaim, 
  onViewDetails 
}) => {
  const formatAddress = (address: CompanyCardProps['company']['address']) => {
    if (!address) return null;
    const parts = [
      address.addressCity,
      address.addressState,
      address.addressCountry
    ].filter(Boolean);
    return parts.join(', ');
  };

  const getImageSrc = () => {
    return company.logoUrl || '/api/placeholder/300/200';
  };

  if (view === 'list') {
    return (
      <StyledCard $view={view}>
        <StyledImage 
          src={getImageSrc()} 
          alt={company.name} 
          $view={view}
        />
        <StyledContent $view={view}>
          <StyledHeader>
            <StyledTitle>
              {company.name}
              {company.pledgeSigned && (
                <IconCertificate size={16} color="#16a34a" />
              )}
            </StyledTitle>
            <StyledBadges>
              {company.verified && (
                <StyledBadge $color="green">
                  <IconCheck size={12} />
                  Verified
                </StyledBadge>
              )}
              {company.featured && (
                <StyledBadge $color="blue">Featured</StyledBadge>
              )}
            </StyledBadges>
          </StyledHeader>

          {company.description && (
            <StyledDescription>{company.description}</StyledDescription>
          )}

          {company.address && (
            <StyledAddress>
              <IconMapPin size={12} />
              {formatAddress(company.address)}
            </StyledAddress>
          )}

          {company.tags && company.tags.length > 0 && (
            <StyledTags>
              {company.tags.slice(0, 3).map((tag) => (
                <StyledTag key={tag}>{tag}</StyledTag>
              ))}
              {company.tags.length > 3 && (
                <StyledTag>+{company.tags.length - 3} more</StyledTag>
              )}
            </StyledTags>
          )}
        </StyledContent>

        <StyledActions>
          {!company.claimed && onClaim && (
            <StyledButton $variant="secondary" onClick={onClaim}>
              Claim This Listing
            </StyledButton>
          )}
          {onViewDetails && (
            <StyledButton $variant="primary" onClick={onViewDetails}>
              View Details
            </StyledButton>
          )}
        </StyledActions>
      </StyledCard>
    );
  }

  return (
    <StyledCard $view={view}>
      <StyledImage 
        src={getImageSrc()} 
        alt={company.name} 
        $view={view}
      />
      <StyledContent $view={view}>
        <StyledHeader>
          <StyledTitle>
            {company.name}
            {company.pledgeSigned && (
              <IconCertificate size={16} color="#16a34a" />
            )}
          </StyledTitle>
          <StyledBadges>
            {company.verified && (
              <StyledBadge $color="green">
                <IconCheck size={12} />
                Verified
              </StyledBadge>
            )}
            {company.featured && (
              <StyledBadge $color="blue">Featured</StyledBadge>
            )}
          </StyledBadges>
        </StyledHeader>

        {company.category && (
          <StyledBadge $color="purple">{company.category}</StyledBadge>
        )}

        {company.description && (
          <StyledDescription>{company.description}</StyledDescription>
        )}

        {company.address && (
          <StyledAddress>
            <IconMapPin size={12} />
            {formatAddress(company.address)}
          </StyledAddress>
        )}

        {company.tags && company.tags.length > 0 && (
          <StyledTags>
            {company.tags.slice(0, 3).map((tag) => (
              <StyledTag key={tag}>{tag}</StyledTag>
            ))}
            {company.tags.length > 3 && (
              <StyledTag>+{company.tags.length - 3} more</StyledTag>
            )}
          </StyledTags>
        )}

        <StyledActions>
          {!company.claimed && onClaim && (
            <StyledButton $variant="secondary" onClick={onClaim}>
              Claim This Listing
            </StyledButton>
          )}
          {onViewDetails && (
            <StyledButton $variant="primary" onClick={onViewDetails}>
              View Details
            </StyledButton>
          )}
        </StyledActions>
      </StyledContent>
    </StyledCard>
  );
};