import { Injectable, Logger } from '@nestjs/common';
import { LeadDiscoveryService, EnrichmentResult } from './lead-discovery.service';
import { EmailCampaignService, CampaignResult, EmailTemplate } from './email-campaign.service';

export interface AiAgentConfig {
  autoDiscoveryEnabled: boolean;
  autoEmailingEnabled: boolean;
  maxLeadsPerCompany: number;
  emailThrottleHours: number;
  minimumAiScore: number;
}

export interface CompanyLeadGeneration {
  companyId: string;
  companyName: string;
  discoveryResult: EnrichmentResult;
  campaignResult?: CampaignResult;
  status: 'discovery_started' | 'discovery_completed' | 'campaign_sent' | 'failed';
  errors: string[];
}

@Injectable()
export class AiAgentService {
  private readonly logger = new Logger(AiAgentService.name);

  private defaultConfig: AiAgentConfig = {
    autoDiscoveryEnabled: true,
    autoEmailingEnabled: false, // Safer default - require manual approval
    maxLeadsPerCompany: 10,
    emailThrottleHours: 24,
    minimumAiScore: 60,
  };

  constructor(
    private readonly leadDiscoveryService: LeadDiscoveryService,
    private readonly emailCampaignService: EmailCampaignService,
  ) {}

  async processCompanyForLeadGeneration(
    companyId: string,
    config: Partial<AiAgentConfig> = {},
  ): Promise<CompanyLeadGeneration> {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const result: CompanyLeadGeneration = {
      companyId,
      companyName: '',
      discoveryResult: {
        success: false,
        leadsFound: 0,
        leadsEnriched: 0,
        errors: [],
      },
      status: 'discovery_started',
      errors: [],
    };

    this.logger.log(`Starting AI agent processing for company: ${companyId}`);

    try {
      // Step 1: Discover leads for the company
      if (mergedConfig.autoDiscoveryEnabled) {
        this.logger.log(`Starting lead discovery for company: ${companyId}`);
        
        result.discoveryResult = await this.leadDiscoveryService.discoverLeadsForCompany(companyId);
        result.status = 'discovery_completed';

        if (!result.discoveryResult.success) {
          result.status = 'failed';
          result.errors.push(...result.discoveryResult.errors);
          return result;
        }

        this.logger.log(`Lead discovery completed for company ${companyId}: ${result.discoveryResult.leadsFound} leads found`);
      }

      // Step 2: Create and send email campaign (if enabled)
      if (mergedConfig.autoEmailingEnabled && result.discoveryResult.leadsFound > 0) {
        this.logger.log(`Starting email campaign for company: ${companyId}`);
        
        result.campaignResult = await this.createAndExecuteBusinessClaimCampaign(
          companyId,
          mergedConfig,
        );

        if (result.campaignResult.success) {
          result.status = 'campaign_sent';
          this.logger.log(`Email campaign completed for company ${companyId}: ${result.campaignResult.emailsSent} emails sent`);
        } else {
          result.errors.push(...result.campaignResult.errors);
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Error in AI agent processing for company ${companyId}:`, error);
      result.status = 'failed';
      result.errors.push(error.message);
      return result;
    }
  }

  async processBatchCompanies(
    companyIds: string[],
    config: Partial<AiAgentConfig> = {},
  ): Promise<CompanyLeadGeneration[]> {
    this.logger.log(`Processing batch of ${companyIds.length} companies`);

    const results: CompanyLeadGeneration[] = [];

    for (const companyId of companyIds) {
      try {
        const result = await this.processCompanyForLeadGeneration(companyId, config);
        results.push(result);

        // Add delay between companies to avoid rate limiting
        if (config.autoEmailingEnabled) {
          await this.delay(2000); // 2 second delay between companies
        }
      } catch (error) {
        this.logger.error(`Error processing company ${companyId}:`, error);
        results.push({
          companyId,
          companyName: '',
          discoveryResult: {
            success: false,
            leadsFound: 0,
            leadsEnriched: 0,
            errors: [error.message],
          },
          status: 'failed',
          errors: [error.message],
        });
      }
    }

    this.logger.log(`Batch processing completed: ${results.length} companies processed`);
    return results;
  }

  private async createAndExecuteBusinessClaimCampaign(
    companyId: string,
    config: AiAgentConfig,
  ): Promise<CampaignResult> {
    try {
      // Get default email template for business claiming
      const emailTemplate = await this.emailCampaignService.getDefaultBusinessClaimTemplate();

      // Create campaign
      const campaign = await this.emailCampaignService.createCampaign(
        `Business Claim Campaign - Company ${companyId}`,
        'Automated campaign to invite discovered leads to claim their business profile',
        emailTemplate,
        [companyId],
      );

      // Execute campaign
      const result = await this.emailCampaignService.executeCampaign(campaign.id);

      return result;
    } catch (error) {
      this.logger.error(`Error creating/executing campaign for company ${companyId}:`, error);
      return {
        success: false,
        emailsSent: 0,
        errors: [error.message],
      };
    }
  }

  async createCustomEmailCampaign(
    name: string,
    description: string,
    emailTemplate: EmailTemplate,
    companyIds: string[],
    autoExecute: boolean = false,
  ): Promise<{ campaignId: string; executed: boolean; result?: CampaignResult }> {
    this.logger.log(`Creating custom email campaign: ${name}`);

    try {
      const campaign = await this.emailCampaignService.createCampaign(
        name,
        description,
        emailTemplate,
        companyIds,
      );

      const response = {
        campaignId: campaign.id,
        executed: false,
      };

      if (autoExecute) {
        response.result = await this.emailCampaignService.executeCampaign(campaign.id);
        response.executed = true;
      }

      return response;
    } catch (error) {
      this.logger.error(`Error creating custom email campaign:`, error);
      throw error;
    }
  }

  async getAiAgentSummary(companyId?: string): Promise<{
    totalLeadsFound: number;
    totalEmailsSent: number;
    totalCampaigns: number;
    activeCampaigns: number;
    conversionRate: number;
    recentActivity: any[];
  }> {
    try {
      // Get all campaigns
      const allCampaigns = await this.emailCampaignService.getCampaigns();
      const activeCampaigns = allCampaigns.filter(c => c.status === 'active');

      // Calculate totals
      const totalEmailsSent = allCampaigns.reduce((sum, c) => sum + (c.emailsSent || 0), 0);
      const totalClaimed = allCampaigns.reduce((sum, c) => sum + (c.companiesClaimed || 0), 0);

      // Get leads (filtered by company if specified)
      let totalLeadsFound = 0;
      if (companyId) {
        const leads = await this.leadDiscoveryService.getLeadsForCompany(companyId);
        totalLeadsFound = leads.length;
      }

      const conversionRate = totalEmailsSent > 0 ? (totalClaimed / totalEmailsSent) * 100 : 0;

      return {
        totalLeadsFound,
        totalEmailsSent,
        totalCampaigns: allCampaigns.length,
        activeCampaigns: activeCampaigns.length,
        conversionRate: Math.round(conversionRate * 100) / 100,
        recentActivity: allCampaigns.slice(0, 5).map(campaign => ({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          emailsSent: campaign.emailsSent || 0,
          companiesClaimed: campaign.companiesClaimed || 0,
          createdAt: campaign.createdAt,
          executedAt: campaign.executedAt,
        })),
      };
    } catch (error) {
      this.logger.error('Error getting AI agent summary:', error);
      throw error;
    }
  }

  async scheduleDiscoveryForAllCompanies(config: Partial<AiAgentConfig> = {}): Promise<{
    scheduled: boolean;
    message: string;
  }> {
    // This would typically integrate with a job queue like Bull or Agenda
    // For now, we'll simulate scheduling
    this.logger.log('Scheduling lead discovery for all companies');

    const mergedConfig = { ...this.defaultConfig, ...config };

    // In a real implementation, this would:
    // 1. Query all companies that haven't been processed recently
    // 2. Add them to a job queue
    // 3. Process them in batches to avoid overwhelming the system

    return {
      scheduled: true,
      message: `Lead discovery scheduled for all companies with config: auto-discovery=${mergedConfig.autoDiscoveryEnabled}, auto-emailing=${mergedConfig.autoEmailingEnabled}`,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getRecommendedActions(): Promise<Array<{
    type: 'discover_leads' | 'send_campaign' | 'review_metrics' | 'claim_follow_up';
    priority: 'high' | 'medium' | 'low';
    message: string;
    actionUrl?: string;
    data?: any;
  }>> {
    const actions = [];

    try {
      // Check for companies without recent lead discovery
      // This would query companies that haven't been processed in the last 30 days
      actions.push({
        type: 'discover_leads',
        priority: 'medium' as const,
        message: 'Run lead discovery for companies that haven\'t been processed recently',
        data: { estimatedCompanies: 10 }, // This would be a real count
      });

      // Check for draft campaigns
      const draftCampaigns = await this.emailCampaignService.getCampaigns('draft');
      if (draftCampaigns.length > 0) {
        actions.push({
          type: 'send_campaign',
          priority: 'high' as const,
          message: `You have ${draftCampaigns.length} draft email campaigns ready to send`,
          data: { campaigns: draftCampaigns.length },
        });
      }

      // Check for campaigns with low open rates
      const activeCampaigns = await this.emailCampaignService.getCampaigns('active');
      const lowPerformingCampaigns = activeCampaigns.filter(c => {
        const openRate = (c.emailsOpened || 0) / (c.emailsSent || 1);
        return openRate < 0.1 && (c.emailsSent || 0) > 10; // Less than 10% open rate
      });

      if (lowPerformingCampaigns.length > 0) {
        actions.push({
          type: 'review_metrics',
          priority: 'medium' as const,
          message: `${lowPerformingCampaigns.length} campaigns have low open rates and may need optimization`,
          data: { campaigns: lowPerformingCampaigns.length },
        });
      }

      return actions;
    } catch (error) {
      this.logger.error('Error getting recommended actions:', error);
      return [];
    }
  }
}