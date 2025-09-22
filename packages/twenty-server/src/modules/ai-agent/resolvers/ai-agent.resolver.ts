import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AiAgentService, CompanyLeadGeneration, AiAgentConfig } from '../services/ai-agent.service';
import { EmailTemplate } from '../services/email-campaign.service';

@Resolver()
export class AiAgentResolver {
  constructor(private readonly aiAgentService: AiAgentService) {}

  @Query(() => String)
  async aiAgentStatus(): Promise<string> {
    return 'AI Agent module is running';
  }

  @Query(() => Object)
  async aiAgentSummary(
    @Args('companyId', { nullable: true }) companyId?: string,
  ): Promise<any> {
    return this.aiAgentService.getAiAgentSummary(companyId);
  }

  @Query(() => [Object])
  async aiAgentRecommendedActions(): Promise<any[]> {
    return this.aiAgentService.getRecommendedActions();
  }

  @Mutation(() => Object)
  async processCompanyForLeadGeneration(
    @Args('companyId') companyId: string,
    @Args('config', { nullable: true }) config?: Partial<AiAgentConfig>,
  ): Promise<CompanyLeadGeneration> {
    return this.aiAgentService.processCompanyForLeadGeneration(companyId, config);
  }

  @Mutation(() => [Object])
  async processBatchCompanies(
    @Args('companyIds', { type: () => [String] }) companyIds: string[],
    @Args('config', { nullable: true }) config?: Partial<AiAgentConfig>,
  ): Promise<CompanyLeadGeneration[]> {
    return this.aiAgentService.processBatchCompanies(companyIds, config);
  }

  @Mutation(() => Object)
  async createCustomEmailCampaign(
    @Args('name') name: string,
    @Args('description') description: string,
    @Args('emailTemplate') emailTemplate: EmailTemplate,
    @Args('companyIds', { type: () => [String] }) companyIds: string[],
    @Args('autoExecute', { defaultValue: false }) autoExecute: boolean,
  ): Promise<{ campaignId: string; executed: boolean; result?: any }> {
    return this.aiAgentService.createCustomEmailCampaign(
      name,
      description,
      emailTemplate,
      companyIds,
      autoExecute,
    );
  }

  @Mutation(() => Object)
  async scheduleDiscoveryForAllCompanies(
    @Args('config', { nullable: true }) config?: Partial<AiAgentConfig>,
  ): Promise<{ scheduled: boolean; message: string }> {
    return this.aiAgentService.scheduleDiscoveryForAllCompanies(config);
  }
}