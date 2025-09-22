import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';

export const LEAD_PROSPECT_STANDARD_FIELD_IDS = {
  id: '20000000-0000-0000-0000-000000000001',
  firstName: '20000000-0000-0000-0000-000000000002',
  lastName: '20000000-0000-0000-0000-000000000003',
  email: '20000000-0000-0000-0000-000000000004',
  jobTitle: '20000000-0000-0000-0000-000000000005',
  linkedinUrl: '20000000-0000-0000-0000-000000000006',
  companyId: '20000000-0000-0000-0000-000000000007',
  aiScore: '20000000-0000-0000-0000-000000000008',
  dataSource: '20000000-0000-0000-0000-000000000009',
  enrichmentStatus: '20000000-0000-0000-0000-00000000000a',
  lastEnriched: '20000000-0000-0000-0000-00000000000b',
  createdBy: '20000000-0000-0000-0000-00000000000c',
  createdAt: '20000000-0000-0000-0000-00000000000d',
  updatedAt: '20000000-0000-0000-0000-00000000000e',
};

@WorkspaceEntity({
  standardId: '20000000-0000-0000-0000-000000000100',
  namePlural: 'leadProspects',
  labelSingular: msg`Lead Prospect`,
  labelPlural: msg`Lead Prospects`,
  description: msg`AI-discovered lead prospects for business claiming`,
  icon: 'IconTargetArrow',
  labelIdentifierStandardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.email,
})
export class LeadProspectWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.firstName,
    type: FieldMetadataType.TEXT,
    label: msg`First Name`,
    description: msg`The prospect's first name`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  firstName: string | null;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.lastName,
    type: FieldMetadataType.TEXT,
    label: msg`Last Name`,
    description: msg`The prospect's last name`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  lastName: string | null;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.email,
    type: FieldMetadataType.EMAIL,
    label: msg`Email`,
    description: msg`The prospect's email address`,
    icon: 'IconMail',
  })
  email: string;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.jobTitle,
    type: FieldMetadataType.TEXT,
    label: msg`Job Title`,
    description: msg`The prospect's job title`,
    icon: 'IconBriefcase',
  })
  @WorkspaceIsNullable()
  jobTitle: string | null;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.linkedinUrl,
    type: FieldMetadataType.TEXT,
    label: msg`LinkedIn URL`,
    description: msg`The prospect's LinkedIn profile URL`,
    icon: 'IconBrandLinkedin',
  })
  @WorkspaceIsNullable()
  linkedinUrl: string | null;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.aiScore,
    type: FieldMetadataType.NUMBER,
    label: msg`AI Score`,
    description: msg`AI-generated lead quality score (0-100)`,
    icon: 'IconRobot',
    defaultValue: 0,
  })
  aiScore: number;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.dataSource,
    type: FieldMetadataType.SELECT,
    label: msg`Data Source`,
    description: msg`Source of prospect data`,
    icon: 'IconDatabase',
    options: [
      { value: 'apollo', label: 'Apollo.io', position: 0 },
      { value: 'linkedin', label: 'LinkedIn', position: 1 },
      { value: 'zoominfo', label: 'ZoomInfo', position: 2 },
      { value: 'hunter', label: 'Hunter.io', position: 3 },
      { value: 'clearbit', label: 'Clearbit', position: 4 },
      { value: 'manual', label: 'Manual Entry', position: 5 },
    ],
    defaultValue: "'manual'",
  })
  dataSource: string;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.enrichmentStatus,
    type: FieldMetadataType.SELECT,
    label: msg`Enrichment Status`,
    description: msg`Status of data enrichment process`,
    icon: 'IconRefresh',
    options: [
      { value: 'pending', label: 'Pending', position: 0 },
      { value: 'enriching', label: 'Enriching', position: 1 },
      { value: 'completed', label: 'Completed', position: 2 },
      { value: 'failed', label: 'Failed', position: 3 },
    ],
    defaultValue: "'pending'",
  })
  enrichmentStatus: string;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.lastEnriched,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Last Enriched`,
    description: msg`When the prospect data was last enriched`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  lastEnriched: Date | null;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.companyId,
    type: RelationType.MANY_TO_ONE,
    label: msg`Company`,
    description: msg`The company this prospect is associated with`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('company')
  companyId: string | null;
}


export const LEAD_PROSPECT_STANDARD_FIELD_IDS = {
  id: '20000000-0000-0000-0000-000000000001',
  firstName: '20000000-0000-0000-0000-000000000002',
  lastName: '20000000-0000-0000-0000-000000000003',
  email: '20000000-0000-0000-0000-000000000004',
  jobTitle: '20000000-0000-0000-0000-000000000005',
  linkedinUrl: '20000000-0000-0000-0000-000000000006',
  companyId: '20000000-0000-0000-0000-000000000007',
  aiScore: '20000000-0000-0000-0000-000000000008',
  dataSource: '20000000-0000-0000-0000-000000000009',
  enrichmentStatus: '20000000-0000-0000-0000-00000000000a',
  lastEnriched: '20000000-0000-0000-0000-00000000000b',
  createdBy: '20000000-0000-0000-0000-00000000000c',
  createdAt: '20000000-0000-0000-0000-00000000000d',
  updatedAt: '20000000-0000-0000-0000-00000000000e',
};

@WorkspaceEntity({
  standardId: '20000000-0000-0000-0000-000000000100',
  namePlural: 'leadProspects',
  labelSingular: msg`Lead Prospect`,
  labelPlural: msg`Lead Prospects`,
  description: msg`AI-discovered lead prospects for business claiming`,
  icon: 'IconTargetArrow',
  labelIdentifierStandardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.email,
})
export class LeadProspectWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.firstName,
    type: FieldMetadataType.TEXT,
    label: msg`First Name`,
    description: msg`The prospect's first name`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  firstName: string | null;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.lastName,
    type: FieldMetadataType.TEXT,
    label: msg`Last Name`,
    description: msg`The prospect's last name`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  lastName: string | null;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.email,
    type: FieldMetadataType.EMAIL,
    label: msg`Email`,
    description: msg`The prospect's email address`,
    icon: 'IconMail',
  })
  email: string;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.jobTitle,
    type: FieldMetadataType.TEXT,
    label: msg`Job Title`,
    description: msg`The prospect's job title`,
    icon: 'IconBriefcase',
  })
  @WorkspaceIsNullable()
  jobTitle: string | null;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.linkedinUrl,
    type: FieldMetadataType.TEXT,
    label: msg`LinkedIn URL`,
    description: msg`The prospect's LinkedIn profile URL`,
    icon: 'IconBrandLinkedin',
  })
  @WorkspaceIsNullable()
  linkedinUrl: string | null;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.aiScore,
    type: FieldMetadataType.NUMBER,
    label: msg`AI Score`,
    description: msg`AI-generated lead quality score (0-100)`,
    icon: 'IconRobot',
    defaultValue: 0,
  })
  aiScore: number;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.dataSource,
    type: FieldMetadataType.SELECT,
    label: msg`Data Source`,
    description: msg`Source of prospect data`,
    icon: 'IconDatabase',
    options: [
      { value: 'apollo', label: 'Apollo.io', position: 0 },
      { value: 'linkedin', label: 'LinkedIn', position: 1 },
      { value: 'zoominfo', label: 'ZoomInfo', position: 2 },
      { value: 'hunter', label: 'Hunter.io', position: 3 },
      { value: 'clearbit', label: 'Clearbit', position: 4 },
      { value: 'manual', label: 'Manual Entry', position: 5 },
    ],
    defaultValue: "'manual'",
  })
  dataSource: string;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.enrichmentStatus,
    type: FieldMetadataType.SELECT,
    label: msg`Enrichment Status`,
    description: msg`Status of data enrichment process`,
    icon: 'IconRefresh',
    options: [
      { value: 'pending', label: 'Pending', position: 0 },
      { value: 'enriching', label: 'Enriching', position: 1 },
      { value: 'completed', label: 'Completed', position: 2 },
      { value: 'failed', label: 'Failed', position: 3 },
    ],
    defaultValue: "'pending'",
  })
  enrichmentStatus: string;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.lastEnriched,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Last Enriched`,
    description: msg`When the prospect data was last enriched`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  lastEnriched: Date | null;

  @WorkspaceField({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: LEAD_PROSPECT_STANDARD_FIELD_IDS.companyId,
    type: RelationType.MANY_TO_ONE,
    label: msg`Company`,
    description: msg`The company this prospect is associated with`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('company')
  companyId: string | null;
}
