import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CompanyClaimService, ClaimBusinessRequest, ClaimVerificationResult } from '../services/company-claim.service';

@Resolver()
export class CompanyClaimResolver {
  constructor(private readonly companyClaimService: CompanyClaimService) {}

  @Query(() => Object)
  async getCompanyClaimStatus(
    @Args('companyId') companyId: string,
  ): Promise<{
    claimed: boolean;
    claimedBy?: string;
    claimedDate?: Date;
    canClaim: boolean;
  }> {
    return this.companyClaimService.getCompanyClaimStatus(companyId);
  }

  @Query(() => Object)
  async getClaimAnalytics(): Promise<{
    totalClaims: number;
    recentClaims: number;
    trialSignups: number;
    conversionRate: number;
  }> {
    return this.companyClaimService.getClaimAnalytics();
  }

  @Mutation(() => Object)
  async initiateCompanyClaim(
    @Args('request') request: ClaimBusinessRequest,
  ): Promise<{
    success: boolean;
    message: string;
    tokenId?: string;
  }> {
    return this.companyClaimService.initiateCompanyClaim(request);
  }

  @Mutation(() => Object)
  async verifyCompanyClaim(
    @Args('token') token: string,
  ): Promise<ClaimVerificationResult> {
    return this.companyClaimService.verifyAndCompleteClaim(token);
  }
}