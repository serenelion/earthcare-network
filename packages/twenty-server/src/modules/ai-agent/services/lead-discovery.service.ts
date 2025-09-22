import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CompanyWorkspaceEntity } from '../../company/standard-objects/company.workspace-entity';
import { LeadProspectWorkspaceEntity } from '../standard-objects/lead-prospect.workspace-entity';

export interface LeadDiscoveryParams {
  companyDomain?: string;
  companyName?: string;
  industry?: string;
  locationCity?: string;
  locationState?: string;
  jobTitles?: string[];
  excludeEmails?: string[];
}

export interface EnrichmentResult {
  success: boolean;
  leadsFound: number;
  leadsEnriched: number;
  errors: string[];
}

@Injectable()
export class LeadDiscoveryService {
  private readonly logger = new Logger(LeadDiscoveryService.name);

  constructor(
    @InjectRepository(LeadProspectWorkspaceEntity)
    private readonly leadProspectRepository: Repository<LeadProspectWorkspaceEntity>,
    @InjectRepository(CompanyWorkspaceEntity)
    private readonly companyRepository: Repository<CompanyWorkspaceEntity>,
  ) {}

  async discoverLeadsForCompany(
    companyId: string,
    params: LeadDiscoveryParams = {},
  ): Promise<EnrichmentResult> {
    this.logger.log(`Discovering leads for company: ${companyId}`);

    try {
      // Get company details
      const company = await this.companyRepository.findOne({
        where: { id: companyId },
      });

      if (!company) {
        throw new Error(`Company not found: ${companyId}`);
      }

      // Use company data for enrichment if params not provided
      const enrichmentParams = {
        companyName: params.companyName || company.name,
        companyDomain:
          params.companyDomain || this.extractDomain(company.domainName),
        locationCity: params.locationCity || company.address?.addressCity,
        locationState: params.locationState || company.address?.addressState,
        jobTitles: params.jobTitles || this.getDefaultJobTitles(),
        ...params,
      };

      // Discover leads from multiple sources
      const discoveredLeads =
        await this.discoverFromMultipleSources(enrichmentParams);

      // Save leads to database
      const savedLeads = await this.saveLeadsToDatabase(
        discoveredLeads,
        companyId,
      );

      // Enrich with additional data
      const enrichmentResults = await this.enrichLeadData(savedLeads);

      return {
        success: true,
        leadsFound: discoveredLeads.length,
        leadsEnriched: enrichmentResults.filter((r) => r.success).length,
        errors: enrichmentResults
          .filter((r) => !r.success)
          .map((r) => r.error)
          .filter(Boolean),
      };
    } catch (error) {
      this.logger.error(
        `Error discovering leads for company ${companyId}:`,
        error,
      );

      return {
        success: false,
        leadsFound: 0,
        leadsEnriched: 0,
        errors: [error.message],
      };
    }
  }

  private async discoverFromMultipleSources(
    params: LeadDiscoveryParams,
  ): Promise<any[]> {
    const allLeads = [];

    // Source 1: Apollo.io simulation (replace with real API)
    const apolloLeads = await this.discoverFromApollo(params);

    allLeads.push(...apolloLeads);

    // Source 2: LinkedIn simulation (replace with real API)
    const linkedinLeads = await this.discoverFromLinkedIn(params);

    allLeads.push(...linkedinLeads);

    // Source 3: Hunter.io simulation (replace with real API)
    const hunterLeads = await this.discoverFromHunter(params);

    allLeads.push(...hunterLeads);

    // Remove duplicates based on email
    const uniqueLeads = this.deduplicateLeads(allLeads);

    return uniqueLeads;
  }

  private async discoverFromApollo(
    params: LeadDiscoveryParams,
  ): Promise<any[]> {
    // Simulate Apollo.io API call
    // In production, replace with actual Apollo.io API integration
    this.logger.log('Discovering leads from Apollo.io simulation');

    const mockLeads = [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: `sarah.johnson@${params.companyDomain}`,
        jobTitle: 'CEO',
        linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
        dataSource: 'apollo',
        aiScore: this.calculateAIScore('CEO', params.companyName),
      },
      {
        firstName: 'Michael',
        lastName: 'Chen',
        email: `michael.chen@${params.companyDomain}`,
        jobTitle: 'Founder',
        linkedinUrl: 'https://linkedin.com/in/michaelchen',
        dataSource: 'apollo',
        aiScore: this.calculateAIScore('Founder', params.companyName),
      },
    ];

    // Filter by job titles if specified
    if (params.jobTitles && params.jobTitles.length > 0) {
      return mockLeads.filter((lead) =>
        params.jobTitles.some((title) =>
          lead.jobTitle.toLowerCase().includes(title.toLowerCase()),
        ),
      );
    }

    return mockLeads;
  }

  private async discoverFromLinkedIn(
    params: LeadDiscoveryParams,
  ): Promise<any[]> {
    // Simulate LinkedIn Sales Navigator API
    this.logger.log('Discovering leads from LinkedIn simulation');

    const mockLeads = [
      {
        firstName: 'Alex',
        lastName: 'Rodriguez',
        email: `alex.rodriguez@${params.companyDomain}`,
        jobTitle: 'Operations Manager',
        linkedinUrl: 'https://linkedin.com/in/alexrodriguez',
        dataSource: 'linkedin',
        aiScore: this.calculateAIScore(
          'Operations Manager',
          params.companyName,
        ),
      },
    ];

    return mockLeads;
  }

  private async discoverFromHunter(
    params: LeadDiscoveryParams,
  ): Promise<any[]> {
    // Simulate Hunter.io domain search
    this.logger.log('Discovering leads from Hunter.io simulation');

    const mockLeads = [
      {
        firstName: 'Emma',
        lastName: 'Thompson',
        email: `emma.thompson@${params.companyDomain}`,
        jobTitle: 'Marketing Director',
        linkedinUrl: null,
        dataSource: 'hunter',
        aiScore: this.calculateAIScore(
          'Marketing Director',
          params.companyName,
        ),
      },
    ];

    return mockLeads;
  }

  private deduplicateLeads(leads: any[]): any[] {
    const seen = new Set();

    return leads.filter((lead) => {
      if (seen.has(lead.email)) {
        return false;
      }
      seen.add(lead.email);

      return true;
    });
  }

  private async saveLeadsToDatabase(
    leads: any[],
    companyId: string,
  ): Promise<LeadProspectWorkspaceEntity[]> {
    const savedLeads = [];

    for (const leadData of leads) {
      try {
        // Check if lead already exists
        const existingLead = await this.leadProspectRepository.findOne({
          where: { email: leadData.email, companyId },
        });

        if (existingLead) {
          this.logger.log(`Lead already exists: ${leadData.email}`);
          savedLeads.push(existingLead);
          continue;
        }

        // Create new lead
        const newLead = this.leadProspectRepository.create({
          ...leadData,
          companyId,
          enrichmentStatus: 'pending',
        });

        const saved = await this.leadProspectRepository.save(newLead);

        savedLeads.push(saved);
        this.logger.log(`Saved new lead: ${leadData.email}`);
      } catch (error) {
        this.logger.error(`Error saving lead ${leadData.email}:`, error);
      }
    }

    return savedLeads;
  }

  private async enrichLeadData(
    leads: LeadProspectWorkspaceEntity[],
  ): Promise<Array<{ success: boolean; error?: string }>> {
    const results = [];

    for (const lead of leads) {
      try {
        // Simulate data enrichment
        const enrichedData = await this.performEnrichment(lead);

        // Update lead with enriched data
        await this.leadProspectRepository.update(lead.id, {
          ...enrichedData,
          enrichmentStatus: 'completed',
          lastEnriched: new Date(),
        });

        results.push({ success: true });
        this.logger.log(`Enriched lead: ${lead.email}`);
      } catch (error) {
        await this.leadProspectRepository.update(lead.id, {
          enrichmentStatus: 'failed',
        });

        results.push({ success: false, error: error.message });
        this.logger.error(`Error enriching lead ${lead.email}:`, error);
      }
    }

    return results;
  }

  private async performEnrichment(
    lead: LeadProspectWorkspaceEntity,
  ): Promise<Partial<LeadProspectWorkspaceEntity>> {
    // Simulate enrichment with additional data sources
    // In production, integrate with real enrichment APIs

    const enrichedData: Partial<LeadProspectWorkspaceEntity> = {};

    // Simulate LinkedIn profile enrichment
    if (!lead.linkedinUrl && lead.firstName && lead.lastName) {
      const linkedinProfileUrl = await this.findLinkedInProfile(
        lead.firstName,
        lead.lastName,
      );

      if (linkedinProfileUrl) {
        enrichedData.linkedinUrl = linkedinProfileUrl;
      }
    }

    // Enhance AI score based on additional factors
    if (lead.jobTitle) {
      enrichedData.aiScore = this.calculateEnhancedAIScore(lead);
    }

    return enrichedData;
  }

  private async findLinkedInProfile(
    firstName: string,
    lastName: string,
  ): Promise<string | null> {
    // Simulate LinkedIn profile discovery
    // In production, use LinkedIn API or web scraping (with proper permissions)
    const profileSlug =
      `${firstName.toLowerCase()}${lastName.toLowerCase()}`.replace(
        /[^a-z]/g,
        '',
      );

    return `https://linkedin.com/in/${profileSlug}`;
  }

  private calculateAIScore(jobTitle: string, companyName?: string): number {
    let score = 50; // Base score

    // Higher scores for decision-making roles
    const decisionMakerTitles = [
      'ceo',
      'founder',
      'president',
      'director',
      'manager',
      'head',
      'vp',
      'chief',
    ];

    if (
      decisionMakerTitles.some((title) =>
        jobTitle.toLowerCase().includes(title),
      )
    ) {
      score += 30;
    }

    // Bonus for sustainability-focused companies
    const sustainabilityKeywords = [
      'green',
      'eco',
      'sustainable',
      'renewable',
      'organic',
      'environmental',
    ];

    if (
      companyName &&
      sustainabilityKeywords.some((keyword) =>
        companyName.toLowerCase().includes(keyword),
      )
    ) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  private calculateEnhancedAIScore(lead: LeadProspectWorkspaceEntity): number {
    let score = lead.aiScore || 50;

    // Bonus for having LinkedIn profile
    if (lead.linkedinUrl) {
      score += 10;
    }

    // Bonus for recent data
    if (lead.lastEnriched && this.isRecent(lead.lastEnriched)) {
      score += 5;
    }

    return Math.min(score, 100);
  }

  private isRecent(date: Date): boolean {
    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return date > thirtyDaysAgo;
  }

  private extractDomain(domainNameLinks: any): string | null {
    // Extract domain from links metadata
    if (domainNameLinks?.primaryLinkUrl) {
      try {
        const url = new URL(domainNameLinks.primaryLinkUrl);

        return url.hostname;
      } catch {
        return null;
      }
    }

    return null;
  }

  private getDefaultJobTitles(): string[] {
    return [
      'CEO',
      'Founder',
      'President',
      'Director',
      'Manager',
      'Head of',
      'Vice President',
      'Chief',
    ];
  }

  async getLeadsForCompany(
    companyId: string,
  ): Promise<LeadProspectWorkspaceEntity[]> {
    return this.leadProspectRepository.find({
      where: { companyId },
      order: { aiScore: 'DESC', createdAt: 'DESC' },
    });
  }

  async updateLeadScore(leadId: string, score: number): Promise<void> {
    await this.leadProspectRepository.update(leadId, { aiScore: score });
  }
}
