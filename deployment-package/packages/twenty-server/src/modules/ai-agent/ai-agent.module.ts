import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LeadDiscoveryService } from './services/lead-discovery.service';
import { EmailCampaignService } from './services/email-campaign.service';
import { AiAgentService } from './services/ai-agent.service';
import { LeadProspectWorkspaceEntity } from './standard-objects/lead-prospect.workspace-entity';
import { EmailCampaignWorkspaceEntity } from './standard-objects/email-campaign.workspace-entity';
import { AiAgentResolver } from './resolvers/ai-agent.resolver';
import { LeadDiscoveryResolver } from './resolvers/lead-discovery.resolver';
import { EmailCampaignResolver } from './resolvers/email-campaign.resolver';

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
  exports: [
    LeadDiscoveryService,
    EmailCampaignService,
    AiAgentService,
  ],
})
export class AiAgentModule {}