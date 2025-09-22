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

export const SPONSOR_STANDARD_FIELD_IDS = {
  companyName: '20202020-s101-4901-bf25-6aeccf7ea419',
  contactEmail: '20202020-s102-4901-bf25-6aeccf7ea419',
  website: '20202020-s103-4901-bf25-6aeccf7ea419',
  logoUrl: '20202020-s104-4901-bf25-6aeccf7ea419',
  description: '20202020-s105-4901-bf25-6aeccf7ea419',
  tier: '20202020-s106-4901-bf25-6aeccf7ea419',
  benefits: '20202020-s107-4901-bf25-6aeccf7ea419',
  active: '20202020-s108-4901-bf25-6aeccf7ea419',
  startDate: '20202020-s109-4901-bf25-6aeccf7ea419',
  endDate: '20202020-s110-4901-bf25-6aeccf7ea419',
  searchVector: '20202020-s111-4901-bf25-6aeccf7ea419',
  position: '20202020-s112-4901-bf25-6aeccf7ea419',
  createdBy: '20202020-s113-4901-bf25-6aeccf7ea419',
};

export const SPONSOR_STANDARD_OBJECT_ID = '20202020-s100-4901-bf25-6aeccf7ea419';

const COMPANY_NAME_FIELD_NAME = 'companyName';
const DESCRIPTION_FIELD_NAME = 'description';

export const SEARCH_FIELDS_FOR_SPONSOR: FieldTypeAndNameMetadata[] = [
  { name: COMPANY_NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: DESCRIPTION_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: SPONSOR_STANDARD_OBJECT_ID,
  namePlural: 'sponsors',
  labelSingular: msg`Sponsor`,
  labelPlural: msg`Sponsors`,
  description: msg`EarthCare Network sponsors and partners`,
  icon: 'IconHeart',
  shortcut: 'S',
  labelIdentifierStandardId: SPONSOR_STANDARD_FIELD_IDS.companyName,
})
@WorkspaceDuplicateCriteria([['companyName']])
@WorkspaceIsSearchable()
export class SponsorWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: SPONSOR_STANDARD_FIELD_IDS.companyName,
    type: FieldMetadataType.TEXT,
    label: msg`Company Name`,
    description: msg`Name of the sponsoring company`,
    icon: 'IconBuilding',
  })
  companyName: string;

  @WorkspaceField({
    standardId: SPONSOR_STANDARD_FIELD_IDS.contactEmail,
    type: FieldMetadataType.EMAILS,
    label: msg`Contact Email`,
    description: msg`Primary contact email for the sponsor`,
    icon: 'IconMail',
  })
  @WorkspaceIsNullable()
  contactEmail: string | null;

  @WorkspaceField({
    standardId: SPONSOR_STANDARD_FIELD_IDS.website,
    type: FieldMetadataType.LINKS,
    label: msg`Website`,
    description: msg`Sponsor company website`,
    icon: 'IconLink',
  })
  @WorkspaceIsNullable()
  website: LinksMetadata | null;

  @WorkspaceField({
    standardId: SPONSOR_STANDARD_FIELD_IDS.logoUrl,
    type: FieldMetadataType.TEXT,
    label: msg`Logo URL`,
    description: msg`URL of the sponsor logo image`,
    icon: 'IconPhoto',
  })
  @WorkspaceIsNullable()
  logoUrl: string | null;

  @WorkspaceField({
    standardId: SPONSOR_STANDARD_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: msg`Description`,
    description: msg`Description of the sponsor and their mission`,
    icon: 'IconFileText',
  })
  @WorkspaceIsNullable()
  description: string | null;

  @WorkspaceField({
    standardId: SPONSOR_STANDARD_FIELD_IDS.tier,
    type: FieldMetadataType.SELECT,
    label: msg`Tier`,
    description: msg`Sponsorship tier level`,
    icon: 'IconTrophy',
    options: [
      { value: 'founding', label: 'Founding Sponsor', position: 0, color: 'purple' },
      { value: 'gold', label: 'Gold Sponsor', position: 1, color: 'yellow' },
      { value: 'silver', label: 'Silver Sponsor', position: 2, color: 'gray' },
      { value: 'bronze', label: 'Bronze Sponsor', position: 3, color: 'orange' },
    ],
  })
  @WorkspaceIsNullable()
  tier: string | null;

  @WorkspaceField({
    standardId: SPONSOR_STANDARD_FIELD_IDS.benefits,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Benefits`,
    description: msg`Sponsorship benefits and perks`,
    icon: 'IconGift',
  })
  @WorkspaceIsNullable()
  benefits: Record<string, any> | null;

  @WorkspaceField({
    standardId: SPONSOR_STANDARD_FIELD_IDS.active,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Active`,
    description: msg`Whether the sponsorship is currently active`,
    icon: 'IconCheck',
    defaultValue: false,
  })
  active: boolean;

  @WorkspaceField({
    standardId: SPONSOR_STANDARD_FIELD_IDS.startDate,
    type: FieldMetadataType.DATE,
    label: msg`Start Date`,
    description: msg`Sponsorship start date`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  startDate: string | null;

  @WorkspaceField({
    standardId: SPONSOR_STANDARD_FIELD_IDS.endDate,
    type: FieldMetadataType.DATE,
    label: msg`End Date`,
    description: msg`Sponsorship end date`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  endDate: string | null;

  @WorkspaceField({
    standardId: SPONSOR_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Sponsor record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: SPONSOR_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;

  @WorkspaceField({
    standardId: SPONSOR_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconSearch',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_SPONSOR,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}