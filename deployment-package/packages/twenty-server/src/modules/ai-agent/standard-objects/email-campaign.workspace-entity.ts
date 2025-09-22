import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';

export const EMAIL_CAMPAIGN_STANDARD_FIELD_IDS = {
  id: '20000000-0000-0000-0000-000000000200',
  name: '20000000-0000-0000-0000-000000000201',
  status: '20000000-0000-0000-0000-000000000202',
  emailsSent: '20000000-0000-0000-0000-000000000203',
  emailsOpened: '20000000-0000-0000-0000-000000000204',
  emailsClicked: '20000000-0000-0000-0000-000000000205',
  emailsReplied: '20000000-0000-0000-0000-000000000206',
  companiesClaimed: '20000000-0000-0000-0000-000000000207',
  trialSignups: '20000000-0000-0000-0000-000000000208',
  subject: '20000000-0000-0000-0000-000000000209',
  emailTemplate: '20000000-0000-0000-0000-00000000020a',
  startDate: '20000000-0000-0000-0000-00000000020b',
  endDate: '20000000-0000-0000-0000-00000000020c',
  createdBy: '20000000-0000-0000-0000-00000000020d',
  createdAt: '20000000-0000-0000-0000-00000000020e',
  updatedAt: '20000000-0000-0000-0000-00000000020f',
};

@WorkspaceEntity({
  standardId: '20000000-0000-0000-0000-000000000300',
  namePlural: 'emailCampaigns',
  labelSingular: msg`Email Campaign`,
  labelPlural: msg`Email Campaigns`,
  description: msg`AI-powered email campaigns for business claiming`,
  icon: 'IconMail',
  labelIdentifierStandardId: EMAIL_CAMPAIGN_STANDARD_FIELD_IDS.name,
})
export class EmailCampaignWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: EMAIL_CAMPAIGN_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Campaign Name`,
    description: msg`Name of the email campaign`,
    icon: 'IconTag',
  })
  name: string;

  @WorkspaceField({
    standardId: EMAIL_CAMPAIGN_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Current status of the campaign`,
    icon: 'IconCircleCheck',
    options: [
      { value: 'draft', label: 'Draft', position: 0 },
      { value: 'active', label: 'Active', position: 1 },
      { value: 'paused', label: 'Paused', position: 2 },
      { value: 'completed', label: 'Completed', position: 3 },
      { value: 'cancelled', label: 'Cancelled', position: 4 },
    ],
    defaultValue: "'draft'",
  })
  status: string;

  @WorkspaceField({
    standardId: EMAIL_CAMPAIGN_STANDARD_FIELD_IDS.emailsSent,
    type: FieldMetadataType.NUMBER,
    label: msg`Emails Sent`,
    description: msg`Total number of emails sent`,
    icon: 'IconSend',
    defaultValue: 0,
  })
  emailsSent: number;

  @WorkspaceField({
    standardId: EMAIL_CAMPAIGN_STANDARD_FIELD_IDS.emailsOpened,
    type: FieldMetadataType.NUMBER,
    label: msg`Emails Opened`,
    description: msg`Number of emails opened`,
    icon: 'IconEye',
    defaultValue: 0,
  })
  emailsOpened: number;

  @WorkspaceField({
    standardId: EMAIL_CAMPAIGN_STANDARD_FIELD_IDS.emailsClicked,
    type: FieldMetadataType.NUMBER,
    label: msg`Emails Clicked`,
    description: msg`Number of emails with clicks`,
    icon: 'IconClick',
    defaultValue: 0,
  })
  emailsClicked: number;

  @WorkspaceField({
    standardId: EMAIL_CAMPAIGN_STANDARD_FIELD_IDS.emailsReplied,
    type: FieldMetadataType.NUMBER,
    label: msg`Emails Replied`,
    description: msg`Number of email replies received`,
    icon: 'IconReply',
    defaultValue: 0,
  })
  emailsReplied: number;

  @WorkspaceField({
    standardId: EMAIL_CAMPAIGN_STANDARD_FIELD_IDS.companiesClaimed,
    type: FieldMetadataType.NUMBER,
    label: msg`Companies Claimed`,
    description: msg`Number of companies claimed through this campaign`,
    icon: 'IconBuildingSkyscraper',
    defaultValue: 0,
  })
  companiesClaimed: number;

  @WorkspaceField({
    standardId: EMAIL_CAMPAIGN_STANDARD_FIELD_IDS.trialSignups,
    type: FieldMetadataType.NUMBER,
    label: msg`Trial Signups`,
    description: msg`Number of trial signups from spatial network`,
    icon: 'IconRocket',
    defaultValue: 0,
  })
  trialSignups: number;

  @WorkspaceField({
    standardId: EMAIL_CAMPAIGN_STANDARD_FIELD_IDS.subject,
    type: FieldMetadataType.TEXT,
    label: msg`Subject Line`,
    description: msg`Email subject line`,
    icon: 'IconMail',
  })
  subject: string;

  @WorkspaceField({
    standardId: EMAIL_CAMPAIGN_STANDARD_FIELD_IDS.emailTemplate,
    type: FieldMetadataType.TEXT,
    label: msg`Email Template`,
    description: msg`HTML email template with placeholders`,
    icon: 'IconTemplate',
  })
  emailTemplate: string;

  @WorkspaceField({
    standardId: EMAIL_CAMPAIGN_STANDARD_FIELD_IDS.startDate,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Start Date`,
    description: msg`When the campaign started`,
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  startDate: Date | null;

  @WorkspaceField({
    standardId: EMAIL_CAMPAIGN_STANDARD_FIELD_IDS.endDate,
    type: FieldMetadataType.DATE_TIME,
    label: msg`End Date`,
    description: msg`When the campaign ended`,
    icon: 'IconCalendarX',
  })
  @WorkspaceIsNullable()
  endDate: Date | null;

  @WorkspaceField({
    standardId: EMAIL_CAMPAIGN_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;
}