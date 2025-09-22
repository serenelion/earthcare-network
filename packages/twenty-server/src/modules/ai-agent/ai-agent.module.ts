import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiAgentResolver } from './resolvers/ai-agent.resolver';
import { EmailCampaignResolver } from './resolvers/email-campaign.resolver';
import { LeadDiscoveryResolver } from './resolvers/lead-discovery.resolver';
import { AiAgentService } from './services/ai-agent.service';
import { EmailCampaignService } from './services/email-campaign.service';
import { LeadDiscoveryService } from './services/lead-discovery.service';
import { EmailCampaignWorkspaceEntity } from './standard-objects/email-campaign.workspace-entity';
import { LeadProspectWorkspaceEntity } from './standard-objects/lead-prospect.workspace-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeadProspectWorkspaceEntity,
      EmailCampaignWorkspaceEntity,
    ]),
  ],
  providers: [
    LeadDiscoveryService,
    EmailCampaignService,
    AiAgentService,
    AiAgentResolver,
    LeadDiscoveryResolver,
    EmailCampaignResolver,
  ],
  exports: [LeadDiscoveryService, EmailCampaignService, AiAgentService],
})
export class AiAgentModule {}
