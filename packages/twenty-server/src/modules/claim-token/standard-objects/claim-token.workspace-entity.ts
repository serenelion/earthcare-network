import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';

import {
    type FieldTypeAndNameMetadata,
    getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';

export const CLAIM_TOKEN_STANDARD_FIELD_IDS = {
  business: '20202020-ct101-4901-bf25-6aeccf7ea419',
  token: '20202020-ct102-4901-bf25-6aeccf7ea419',
  email: '20202020-ct103-4901-bf25-6aeccf7ea419',
  used: '20202020-ct104-4901-bf25-6aeccf7ea419',
  expiresAt: '20202020-ct105-4901-bf25-6aeccf7ea419',
  searchVector: '20202020-ct106-4901-bf25-6aeccf7ea419',
  position: '20202020-ct107-4901-bf25-6aeccf7ea419',
  createdBy: '20202020-ct108-4901-bf25-6aeccf7ea419',
};

export const CLAIM_TOKEN_STANDARD_OBJECT_ID = '20202020-ct100-4901-bf25-6aeccf7ea419';

const EMAIL_FIELD_NAME = 'email';
const TOKEN_FIELD_NAME = 'token';

export const SEARCH_FIELDS_FOR_CLAIM_TOKEN: FieldTypeAndNameMetadata[] = [
  { name: EMAIL_FIELD_NAME, type: FieldMetadataType.EMAILS },
  { name: TOKEN_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: CLAIM_TOKEN_STANDARD_OBJECT_ID,
  namePlural: 'claimTokens',
  labelSingular: msg`Claim Token`,
  labelPlural: msg`Claim Tokens`,
  description: msg`Tokens for business claiming verification`,
  icon: 'IconKey',
  shortcut: 'K',
  labelIdentifierStandardId: CLAIM_TOKEN_STANDARD_FIELD_IDS.token,
})
@WorkspaceIsSearchable()
export class ClaimTokenWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CLAIM_TOKEN_STANDARD_FIELD_IDS.token,
    type: FieldMetadataType.TEXT,
    label: msg`Token`,
    description: msg`Unique verification token`,
    icon: 'IconKey',
  })
  token: string;

  @WorkspaceField({
    standardId: CLAIM_TOKEN_STANDARD_FIELD_IDS.email,
    type: FieldMetadataType.EMAILS,
    label: msg`Email`,
    description: msg`Email address for which the token was generated`,
    icon: 'IconMail',
  })
  @WorkspaceIsNullable()
  email: string | null;

  @WorkspaceField({
    standardId: CLAIM_TOKEN_STANDARD_FIELD_IDS.used,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Used`,
    description: msg`Whether the token has been used`,
    icon: 'IconCheck',
    defaultValue: false,
  })
  used: boolean;

  @WorkspaceField({
    standardId: CLAIM_TOKEN_STANDARD_FIELD_IDS.expiresAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Expires At`,
    description: msg`When the token expires`,
    icon: 'IconClock',
  })
  @WorkspaceIsNullable()
  expiresAt: string | null;

  @WorkspaceField({
    standardId: CLAIM_TOKEN_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Token record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: CLAIM_TOKEN_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: CLAIM_TOKEN_STANDARD_FIELD_IDS.business,
    type: RelationType.MANY_TO_ONE,
    label: msg`Business`,
    description: msg`Business associated with this claim token`,
    icon: 'IconBuilding',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'claimTokens',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  business: Relation<CompanyWorkspaceEntity>;

  @WorkspaceJoinColumn('business')
  businessId: string;

  @WorkspaceField({
    standardId: CLAIM_TOKEN_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconSearch',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_CLAIM_TOKEN,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}