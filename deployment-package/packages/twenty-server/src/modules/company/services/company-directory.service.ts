import { Injectable } from '@nestjs/common';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ClaimCompanyDto } from 'src/modules/company/dto/claim-company.dto';
import { CompanyDirectoryDto } from 'src/modules/company/dto/company-directory.dto';
import { VerifyClaimDto } from 'src/modules/company/dto/verify-claim.dto';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';

interface CompanyDirectoryFilters {
  category?: string;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number;
  pledgeSignedOnly?: boolean;
  verifiedOnly?: boolean;
  featuredOnly?: boolean;
  limit?: number;
  offset?: number;
}

@Injectable()
export class CompanyDirectoryService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  private async getCompanyRepository(workspaceId: string) {
    const dataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId,
      });

    return dataSource.getRepository(CompanyWorkspaceEntity);
  }

  async getCompanyDirectory(
    filters: CompanyDirectoryFilters = {},
  ): Promise<CompanyDirectoryDto[]> {
    // For now, return mock data until we properly add EarthCare fields
    const mockCompanies: CompanyDirectoryDto[] = [
      {
        id: '1',
        name: 'Green Valley Permaculture',
        description:
          'Sustainable farming and education center specializing in permaculture design and organic food production.',
        slug: 'green-valley-permaculture',
        latitude: 45.5152,
        longitude: -122.6784,
        category: 'permaculture',
        tags: ['organic', 'education', 'farm-tours'],
        pledgeSigned: true,
        claimed: true,
        verified: true,
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'EcoTech Solutions',
        description: 'Renewable energy systems and sustainable technology.',
        slug: 'ecotech-solutions',
        latitude: 37.7749,
        longitude: -122.4194,
        category: 'renewable-energy',
        tags: ['solar', 'wind', 'technology'],
        pledgeSigned: true,
        claimed: false,
        verified: false,
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return mockCompanies
      .filter((company) => {
        if (filters.category && company.category !== filters.category)
          return false;
        if (filters.verifiedOnly && !company.verified) return false;
        if (filters.featuredOnly && !company.featured) return false;
        if (filters.pledgeSignedOnly && !company.pledgeSigned) return false;

        return true;
      })
      .slice(
        filters.offset || 0,
        (filters.offset || 0) + (filters.limit || 50),
      );
  }

  async getCompanyBySlug(slug: string): Promise<CompanyDirectoryDto | null> {
    const companies = await this.getCompanyDirectory();

    return companies.find((c) => c.slug === slug) || null;
  }

  async getCompaniesNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    limit: number,
  ): Promise<CompanyDirectoryDto[]> {
    const companies = await this.getCompanyDirectory();

    return companies.slice(0, limit);
  }

  async getCompanyCategories(): Promise<string[]> {
    return ['permaculture', 'renewable-energy', 'eco-building', 'organic-food'];
  }

  async getCompanyTags(): Promise<string[]> {
    return [
      'organic',
      'education',
      'farm-tours',
      'solar',
      'wind',
      'technology',
    ];
  }

  async claimCompany(input: ClaimCompanyDto): Promise<boolean> {
    // Mock implementation
    console.log('Claiming company:', input);

    return true;
  }

  async verifyCompanyClaim(input: VerifyClaimDto): Promise<boolean> {
    // Mock implementation
    console.log('Verifying claim:', input);

    return true;
  }

  async isCompanyClaimable(companyId: string): Promise<boolean> {
    // Mock implementation
    return true;
  }

  private mapToDto(company: CompanyWorkspaceEntity): CompanyDirectoryDto {
    return {
      id: company.id,
      name: company.name,
      slug:
        company.domainName?.primaryLinkUrl ||
        company.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date(company.createdAt).toISOString(),
      updatedAt: new Date(company.updatedAt).toISOString(),
    };
  }
}
