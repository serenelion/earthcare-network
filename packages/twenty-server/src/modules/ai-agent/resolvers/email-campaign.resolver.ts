import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { EmailCampaignService, CampaignResult, CampaignMetrics, EmailTemplate } from '../services/email-campaign.service';
import { EmailCampaignWorkspaceEntity } from '../standard-objects/email-campaign.workspace-entity';

@Resolver()
export class EmailCampaignResolver {
  constructor(private readonly emailCampaignService: EmailCampaignService) {}

  @Query(() => [Object])
  async getCampaigns(
    @Args('status', { nullable: true }) status?: string,
  ): Promise<EmailCampaignWorkspaceEntity[]> {
    return this.emailCampaignService.getCampaigns(status);
  }

  @Query(() => Object)
  async getCampaignMetrics(
    @Args('campaignId') campaignId: string,
  ): Promise<CampaignMetrics> {
    return this.emailCampaignService.getCampaignMetrics(campaignId);
  }

  @Query(() => Object)
  async getDefaultBusinessClaimTemplate(): Promise<EmailTemplate> {
    return this.emailCampaignService.getDefaultBusinessClaimTemplate();
  }

  @Mutation(() => Object)
  async createCampaign(
    @Args('name') name: string,
    @Args('description') description: string,
    @Args('emailTemplate') emailTemplate: EmailTemplate,
    @Args('companyIds', { type: () => [String], nullable: true }) companyIds?: string[],
  ): Promise<EmailCampaignWorkspaceEntity> {
    return this.emailCampaignService.createCampaign(name, description, emailTemplate, companyIds);
  }

  @Mutation(() => Object)
  async executeCampaign(
    @Args('campaignId') campaignId: string,
  ): Promise<CampaignResult> {
    return this.emailCampaignService.executeCampaign(campaignId);
  }

  @Mutation(() => String)
  async pauseCampaign(
    @Args('campaignId') campaignId: string,
  ): Promise<string> {
    await this.emailCampaignService.pauseCampaign(campaignId);
    return 'Campaign paused successfully';
  }

  @Mutation(() => String)
  async resumeCampaign(
    @Args('campaignId') campaignId: string,
  ): Promise<string> {
    await this.emailCampaignService.resumeCampaign(campaignId);
    return 'Campaign resumed successfully';
  }

  @Mutation(() => String)
  async updateCampaignMetrics(
    @Args('campaignId') campaignId: string,
    @Args('type') type: 'opened' | 'clicked' | 'replied' | 'claimed' | 'trial_signup',
  ): Promise<string> {
    await this.emailCampaignService.updateCampaignMetrics(campaignId, type);
    return 'Campaign metrics updated successfully';
  }
}