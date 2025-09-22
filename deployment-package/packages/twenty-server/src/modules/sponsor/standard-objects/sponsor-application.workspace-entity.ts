import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { LinksMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceDuplicateCriteria } from 'src/engine/twenty-orm/decorators/workspace-duplicate-criteria.decorator';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';

import {
    type FieldTypeAndNameMetadata,
    getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';

export const SPONSOR_APPLICATION_STANDARD_FIELD_IDS = {
  companyName: '20202020-sa101-4901-bf25-6aeccf7ea419',
  contactName: '20202020-sa102-4901-bf25-6aeccf7ea419',
  contactEmail: '20202020-sa103-4901-bf25-6aeccf7ea419',
  phone: '20202020-sa104-4901-bf25-6aeccf7ea419',
  website: '20202020-sa105-4901-bf25-6aeccf7ea419',
  message: '20202020-sa106-4901-bf25-6aeccf7ea419',
  budgetRange: '20202020-sa107-4901-bf25-6aeccf7ea419',
  status: '20202020-sa108-4901-bf25-6aeccf7ea419',
  notes: '20202020-sa109-4901-bf25-6aeccf7ea419',
  searchVector: '20202020-sa110-4901-bf25-6aeccf7ea419',
  position: '20202020-sa111-4901-bf25-6aeccf7ea419',
  createdBy: '20202020-sa112-4901-bf25-6aeccf7ea419',
};

export const SPONSOR_APPLICATION_STANDARD_OBJECT_ID = '20202020-sa100-4901-bf25-6aeccf7ea419';

const COMPANY_NAME_FIELD_NAME = 'companyName';
const CONTACT_NAME_FIELD_NAME = 'contactName';
const MESSAGE_FIELD_NAME = 'message';

export const SEARCH_FIELDS_FOR_SPONSOR_APPLICATION: FieldTypeAndNameMetadata[] = [
  { name: COMPANY_NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: CONTACT_NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: MESSAGE_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: SPONSOR_APPLICATION_STANDARD_OBJECT_ID,
  namePlural: 'sponsorApplications',
  labelSingular: msg`Sponsor Application`,
  labelPlural: msg`Sponsor Applications`,
  description: msg`Applications from companies wanting to sponsor EarthCare Network`,
  icon: 'IconForms',
  shortcut: 'A',
  labelIdentifierStandardId: SPONSOR_APPLICATION_STANDARD_FIELD_IDS.companyName,
})
@WorkspaceDuplicateCriteria([['companyName', 'contactEmail']])
@WorkspaceIsSearchable()
export class SponsorApplicationWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: SPONSOR_APPLICATION_STANDARD_FIELD_IDS.companyName,
    type: FieldMetadataType.TEXT,
    label: msg`Company Name`,
    description: msg`Name of the applying company`,
    icon: 'IconBuilding',
  })
  @WorkspaceIsNullable()
  companyName: string | null;

  @WorkspaceField({
    standardId: SPONSOR_APPLICATION_STANDARD_FIELD_IDS.contactName,
    type: FieldMetadataType.TEXT,
    label: msg`Contact Name`,
    description: msg`Name of the contact person`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  contactName: string | null;

  @WorkspaceField({
    standardId: SPONSOR_APPLICATION_STANDARD_FIELD_IDS.contactEmail,
    type: FieldMetadataType.EMAILS,
    label: msg`Contact Email`,
    description: msg`Email address of the contact person`,
    icon: 'IconMail',
  })
  @WorkspaceIsNullable()
  contactEmail: string | null;

  @WorkspaceField({
    standardId: SPONSOR_APPLICATION_STANDARD_FIELD_IDS.phone,
    type: FieldMetadataType.PHONES,
    label: msg`Phone`,
    description: msg`Contact phone number`,
    icon: 'IconPhone',
  })
  @WorkspaceIsNullable()
  phone: string | null;

  @WorkspaceField({
    standardId: SPONSOR_APPLICATION_STANDARD_FIELD_IDS.website,
    type: FieldMetadataType.LINKS,
    label: msg`Website`,
    description: msg`Company website URL`,
    icon: 'IconLink',
  })
  @WorkspaceIsNullable()
  website: LinksMetadata | null;

  @WorkspaceField({
    standardId: SPONSOR_APPLICATION_STANDARD_FIELD_IDS.message,
    type: FieldMetadataType.TEXT,
    label: msg`Message`,
    description: msg`Message from the applicant about their interest in sponsoring`,
    icon: 'IconMessage',
  })
  @WorkspaceIsNullable()
  message: string | null;

  @WorkspaceField({
    standardId: SPONSOR_APPLICATION_STANDARD_FIELD_IDS.budgetRange,
    type: FieldMetadataType.SELECT,
    label: msg`Budget Range`,
    description: msg`Estimated sponsorship budget range`,
    icon: 'IconCurrencyDollar',
    options: [
      { value: 'under-5k', label: 'Under $5,000', position: 0, color: 'green' },
      { value: '5k-15k', label: '$5,000 - $15,000', position: 1, color: 'blue' },
      { value: '15k-50k', label: '$15,000 - $50,000', position: 2, color: 'orange' },
      { value: 'over-50k', label: 'Over $50,000', position: 3, color: 'purple' },
      { value: 'custom', label: 'Custom Package', position: 4, color: 'gray' },
    ],
  })
  @WorkspaceIsNullable()
  budgetRange: string | null;

  @WorkspaceField({
    standardId: SPONSOR_APPLICATION_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Application status`,
    icon: 'IconFlag',
    options: [
      { value: 'pending', label: 'Pending', position: 0, color: 'yellow' },
      { value: 'reviewing', label: 'Under Review', position: 1, color: 'blue' },
      { value: 'approved', label: 'Approved', position: 2, color: 'green' },
      { value: 'rejected', label: 'Rejected', position: 3, color: 'red' },
    ],
    defaultValue: 'pending',
  })
  status: string;

  @WorkspaceField({
    standardId: SPONSOR_APPLICATION_STANDARD_FIELD_IDS.notes,
    type: FieldMetadataType.TEXT,
    label: msg`Notes`,
    description: msg`Internal notes about the application`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  notes: string | null;

  @WorkspaceField({
    standardId: SPONSOR_APPLICATION_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Application record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: SPONSOR_APPLICATION_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;

  @WorkspaceField({
    standardId: SPONSOR_APPLICATION_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconSearch',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_SPONSOR_APPLICATION,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}