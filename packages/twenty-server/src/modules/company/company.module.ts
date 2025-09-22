import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyWorkspaceEntity } from './standard-objects/company.workspace-entity';
import { CompanyClaimService } from './services/company-claim.service';
import { CompanyClaimResolver } from './resolvers/company-claim.resolver';
import { SpatialNetworkIntegrationService } from './services/spatial-network-integration.service';
import { SpatialNetworkResolver } from './resolvers/spatial-network.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyWorkspaceEntity])],
  providers: [
    CompanyClaimService,
    CompanyClaimResolver,
    SpatialNetworkIntegrationService,
    SpatialNetworkResolver,
  ],
  exports: [CompanyClaimService, SpatialNetworkIntegrationService],
})
export class CompanyModule {}
