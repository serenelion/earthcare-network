import styled from '@emotion/styled';
import React from 'react';
import { IconSearch } from 'twenty-ui/display';

const StyledSearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 400px;
`;

const StyledSearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  background: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  transition: all 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.tertiary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.blue};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.color.blue}20;
  }
`;

const StyledSearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.font.color.tertiary};
  pointer-events: none;
`;

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
}) => {
  return (
    <StyledSearchContainer>
      <StyledSearchIcon>
        <IconSearch size={16} />
      </StyledSearchIcon>
      <StyledSearchInput
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </StyledSearchContainer>
  );
};
