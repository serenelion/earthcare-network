import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { 
  SpatialNetworkIntegrationService, 
  BuildProTrialRequest, 
  TrialCreationResult 
} from '../services/spatial-network-integration.service';

@Resolver()
export class SpatialNetworkResolver {
  constructor(
    private readonly spatialNetworkService: SpatialNetworkIntegrationService,
  ) {}

  @Query(() => Object)
  async getBuildProTrialStatus(
    @Args('companyId') companyId: string,
  ): Promise<{
    hasActiveTrial: boolean;
    trialStartDate?: Date;
    trialExpiresAt?: Date;
    trialUrl?: string;
  }> {
    return this.spatialNetworkService.getBuildProTrialStatus(companyId);
  }

  @Query(() => Object)
  async getTrialAnalytics(): Promise<{
    totalTrialsCreated: number;
    activeTrials: number;
    expiredTrials: number;
    conversionRate: number;
  }> {
    return this.spatialNetworkService.getTrialAnalytics();
  }

  @Mutation(() => Object)
  async createBuildProTrial(
    @Args('request') request: BuildProTrialRequest,
  ): Promise<TrialCreationResult> {
    return this.spatialNetworkService.createBuildProTrial(request);
  }

  @Mutation(() => Object)
  async handleSpatialNetworkWebhook(
    @Args('eventType') eventType: string,
    @Args('payload') payload: any,
  ): Promise<{ success: boolean; message: string }> {
    return this.spatialNetworkService.handleSpatialNetworkWebhook(eventType, payload);
  }
}