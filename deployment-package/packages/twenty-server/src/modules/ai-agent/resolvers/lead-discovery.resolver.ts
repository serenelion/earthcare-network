import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { LeadDiscoveryService, LeadDiscoveryParams, EnrichmentResult } from '../services/lead-discovery.service';
import { LeadProspectWorkspaceEntity } from '../standard-objects/lead-prospect.workspace-entity';

@Resolver()
export class LeadDiscoveryResolver {
  constructor(private readonly leadDiscoveryService: LeadDiscoveryService) {}

  @Query(() => [Object])
  async getLeadsForCompany(
    @Args('companyId') companyId: string,
  ): Promise<LeadProspectWorkspaceEntity[]> {
    return this.leadDiscoveryService.getLeadsForCompany(companyId);
  }

  @Mutation(() => Object)
  async discoverLeadsForCompany(
    @Args('companyId') companyId: string,
    @Args('params', { nullable: true }) params?: LeadDiscoveryParams,
  ): Promise<EnrichmentResult> {
    return this.leadDiscoveryService.discoverLeadsForCompany(companyId, params);
  }

  @Mutation(() => String)
  async updateLeadScore(
    @Args('leadId') leadId: string,
    @Args('score') score: number,
  ): Promise<string> {
    await this.leadDiscoveryService.updateLeadScore(leadId, score);
    return 'Lead score updated successfully';
  }
}