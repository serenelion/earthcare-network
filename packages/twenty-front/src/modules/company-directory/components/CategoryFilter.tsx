import styled from '@emotion/styled';
import React from 'react';

const StyledFilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  cursor: pointer;
  min-width: 180px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.blue};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.color.blue}20;
  }
`;

interface Category {
  value: string;
  label: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <StyledFilterContainer>
      <StyledLabel htmlFor="category-filter">Category:</StyledLabel>
      <StyledSelect
        id="category-filter"
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        {categories.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </StyledSelect>
    </StyledFilterContainer>
  );
};
