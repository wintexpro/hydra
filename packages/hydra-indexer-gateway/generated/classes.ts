// This file has been auto-generated by Warthog.  Do not update directly as it
// will be re-written.  If you need to change this file, update models or add
// new TypeGraphQL objects
// prettier-ignore
// @ts-ignore
import { DateResolver as Date } from 'graphql-scalars';
// prettier-ignore
// @ts-ignore
import { GraphQLID as ID } from 'graphql';
// prettier-ignore
// @ts-ignore
import { ArgsType, Field as TypeGraphQLField, Float, InputType as TypeGraphQLInputType, Int } from 'type-graphql';
// prettier-ignore
// @ts-ignore
import { registerEnumType, GraphQLISODateTime as DateTime } from "type-graphql";

// prettier-ignore
// @ts-ignore eslint-disable-next-line @typescript-eslint/no-var-requires
const { GraphQLJSONObject } = require('graphql-type-json');
// prettier-ignore
// @ts-ignore
import { BaseWhereInput, JsonObject, PaginationArgs, DateOnlyString, DateTimeString } from 'warthog';

// @ts-ignore
import { SubstrateExtrinsic } from "../src/modules/substrate-extrinsic/substrate-extrinsic.model";
// @ts-ignore
import { SubstrateEvent } from "../src/modules/substrate-event/substrate-event.model";

export enum SubstrateExtrinsicOrderByEnum {
  createdAt_ASC = "createdAt_ASC",
  createdAt_DESC = "createdAt_DESC",

  updatedAt_ASC = "updatedAt_ASC",
  updatedAt_DESC = "updatedAt_DESC",

  deletedAt_ASC = "deletedAt_ASC",
  deletedAt_DESC = "deletedAt_DESC",

  tip_ASC = "tip_ASC",
  tip_DESC = "tip_DESC",

  blockNumber_ASC = "blockNumber_ASC",
  blockNumber_DESC = "blockNumber_DESC",

  versionInfo_ASC = "versionInfo_ASC",
  versionInfo_DESC = "versionInfo_DESC",

  method_ASC = "method_ASC",
  method_DESC = "method_DESC",

  section_ASC = "section_ASC",
  section_DESC = "section_DESC",

  signer_ASC = "signer_ASC",
  signer_DESC = "signer_DESC",

  signature_ASC = "signature_ASC",
  signature_DESC = "signature_DESC",

  nonce_ASC = "nonce_ASC",
  nonce_DESC = "nonce_DESC",

  hash_ASC = "hash_ASC",
  hash_DESC = "hash_DESC",

  isSigned_ASC = "isSigned_ASC",
  isSigned_DESC = "isSigned_DESC"
}

registerEnumType(SubstrateExtrinsicOrderByEnum, {
  name: "SubstrateExtrinsicOrderByInput"
});

@TypeGraphQLInputType()
export class SubstrateExtrinsicWhereInput {
  @TypeGraphQLField(() => ID, { nullable: true })
  id_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  id_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  createdById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  createdById_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  updatedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  updatedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  deletedAt_all?: Boolean;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  deletedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  deletedById_in?: string[];

  @TypeGraphQLField(() => Float, { nullable: true })
  tip_eq?: number;

  @TypeGraphQLField(() => Float, { nullable: true })
  tip_gt?: number;

  @TypeGraphQLField(() => Float, { nullable: true })
  tip_gte?: number;

  @TypeGraphQLField(() => Float, { nullable: true })
  tip_lt?: number;

  @TypeGraphQLField(() => Float, { nullable: true })
  tip_lte?: number;

  @TypeGraphQLField(() => [Float], { nullable: true })
  tip_in?: number[];

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_eq?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_gt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_gte?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_lt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_lte?: number;

  @TypeGraphQLField(() => [Int], { nullable: true })
  blockNumber_in?: number[];

  @TypeGraphQLField({ nullable: true })
  versionInfo_eq?: string;

  @TypeGraphQLField({ nullable: true })
  versionInfo_contains?: string;

  @TypeGraphQLField({ nullable: true })
  versionInfo_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  versionInfo_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  versionInfo_in?: string[];

  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  meta_json?: JsonObject;

  @TypeGraphQLField({ nullable: true })
  method_eq?: string;

  @TypeGraphQLField({ nullable: true })
  method_contains?: string;

  @TypeGraphQLField({ nullable: true })
  method_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  method_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  method_in?: string[];

  @TypeGraphQLField({ nullable: true })
  section_eq?: string;

  @TypeGraphQLField({ nullable: true })
  section_contains?: string;

  @TypeGraphQLField({ nullable: true })
  section_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  section_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  section_in?: string[];

  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  args_json?: JsonObject;

  @TypeGraphQLField({ nullable: true })
  signer_eq?: string;

  @TypeGraphQLField({ nullable: true })
  signer_contains?: string;

  @TypeGraphQLField({ nullable: true })
  signer_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  signer_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  signer_in?: string[];

  @TypeGraphQLField({ nullable: true })
  signature_eq?: string;

  @TypeGraphQLField({ nullable: true })
  signature_contains?: string;

  @TypeGraphQLField({ nullable: true })
  signature_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  signature_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  signature_in?: string[];

  @TypeGraphQLField(() => Int, { nullable: true })
  nonce_eq?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  nonce_gt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  nonce_gte?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  nonce_lt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  nonce_lte?: number;

  @TypeGraphQLField(() => [Int], { nullable: true })
  nonce_in?: number[];

  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  era_json?: JsonObject;

  @TypeGraphQLField({ nullable: true })
  hash_eq?: string;

  @TypeGraphQLField({ nullable: true })
  hash_contains?: string;

  @TypeGraphQLField({ nullable: true })
  hash_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  hash_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  hash_in?: string[];

  @TypeGraphQLField(() => Boolean, { nullable: true })
  isSigned_eq?: Boolean;

  @TypeGraphQLField(() => [Boolean], { nullable: true })
  isSigned_in?: Boolean[];
}

@TypeGraphQLInputType()
export class SubstrateExtrinsicWhereUniqueInput {
  @TypeGraphQLField(() => ID)
  id?: string;
}

@TypeGraphQLInputType()
export class SubstrateExtrinsicCreateInput {
  @TypeGraphQLField()
  tip!: number;

  @TypeGraphQLField()
  blockNumber!: number;

  @TypeGraphQLField()
  versionInfo!: string;

  @TypeGraphQLField(() => GraphQLJSONObject)
  meta!: JsonObject;

  @TypeGraphQLField()
  method!: string;

  @TypeGraphQLField()
  section!: string;

  @TypeGraphQLField(() => GraphQLJSONObject)
  args!: JsonObject;

  @TypeGraphQLField()
  signer!: string;

  @TypeGraphQLField()
  signature!: string;

  @TypeGraphQLField()
  nonce!: number;

  @TypeGraphQLField(() => GraphQLJSONObject)
  era!: JsonObject;

  @TypeGraphQLField()
  hash!: string;

  @TypeGraphQLField()
  isSigned!: boolean;
}

@TypeGraphQLInputType()
export class SubstrateExtrinsicUpdateInput {
  @TypeGraphQLField({ nullable: true })
  tip?: number;

  @TypeGraphQLField({ nullable: true })
  blockNumber?: number;

  @TypeGraphQLField({ nullable: true })
  versionInfo?: string;

  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  meta?: JsonObject;

  @TypeGraphQLField({ nullable: true })
  method?: string;

  @TypeGraphQLField({ nullable: true })
  section?: string;

  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  args?: JsonObject;

  @TypeGraphQLField({ nullable: true })
  signer?: string;

  @TypeGraphQLField({ nullable: true })
  signature?: string;

  @TypeGraphQLField({ nullable: true })
  nonce?: number;

  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  era?: JsonObject;

  @TypeGraphQLField({ nullable: true })
  hash?: string;

  @TypeGraphQLField({ nullable: true })
  isSigned?: boolean;
}

@ArgsType()
export class SubstrateExtrinsicWhereArgs extends PaginationArgs {
  @TypeGraphQLField(() => SubstrateExtrinsicWhereInput, { nullable: true })
  where?: SubstrateExtrinsicWhereInput;

  @TypeGraphQLField(() => SubstrateExtrinsicOrderByEnum, { nullable: true })
  orderBy?: SubstrateExtrinsicOrderByEnum;
}

@ArgsType()
export class SubstrateExtrinsicCreateManyArgs {
  @TypeGraphQLField(() => [SubstrateExtrinsicCreateInput])
  data!: SubstrateExtrinsicCreateInput[];
}

@ArgsType()
export class SubstrateExtrinsicUpdateArgs {
  @TypeGraphQLField() data!: SubstrateExtrinsicUpdateInput;
  @TypeGraphQLField() where!: SubstrateExtrinsicWhereUniqueInput;
}

export enum SubstrateEventOrderByEnum {
  createdAt_ASC = "createdAt_ASC",
  createdAt_DESC = "createdAt_DESC",

  updatedAt_ASC = "updatedAt_ASC",
  updatedAt_DESC = "updatedAt_DESC",

  deletedAt_ASC = "deletedAt_ASC",
  deletedAt_DESC = "deletedAt_DESC",

  name_ASC = "name_ASC",
  name_DESC = "name_DESC",

  section_ASC = "section_ASC",
  section_DESC = "section_DESC",

  method_ASC = "method_ASC",
  method_DESC = "method_DESC",

  blockNumber_ASC = "blockNumber_ASC",
  blockNumber_DESC = "blockNumber_DESC",

  index_ASC = "index_ASC",
  index_DESC = "index_DESC"
}

registerEnumType(SubstrateEventOrderByEnum, {
  name: "SubstrateEventOrderByInput"
});

@TypeGraphQLInputType()
export class SubstrateEventWhereInput {
  @TypeGraphQLField(() => ID, { nullable: true })
  id_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  id_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  createdAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  createdById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  createdById_in?: string[];

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  updatedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  updatedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  updatedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  deletedAt_all?: Boolean;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_eq?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_lte?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gt?: Date;

  @TypeGraphQLField(() => DateTime, { nullable: true })
  deletedAt_gte?: Date;

  @TypeGraphQLField(() => ID, { nullable: true })
  deletedById_eq?: string;

  @TypeGraphQLField(() => [ID], { nullable: true })
  deletedById_in?: string[];

  @TypeGraphQLField({ nullable: true })
  name_eq?: string;

  @TypeGraphQLField({ nullable: true })
  name_contains?: string;

  @TypeGraphQLField({ nullable: true })
  name_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  name_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  name_in?: string[];

  @TypeGraphQLField({ nullable: true })
  section_eq?: string;

  @TypeGraphQLField({ nullable: true })
  section_contains?: string;

  @TypeGraphQLField({ nullable: true })
  section_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  section_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  section_in?: string[];

  @TypeGraphQLField({ nullable: true })
  method_eq?: string;

  @TypeGraphQLField({ nullable: true })
  method_contains?: string;

  @TypeGraphQLField({ nullable: true })
  method_startsWith?: string;

  @TypeGraphQLField({ nullable: true })
  method_endsWith?: string;

  @TypeGraphQLField(() => [String], { nullable: true })
  method_in?: string[];

  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  phase_json?: JsonObject;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_eq?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_gt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_gte?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_lt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  blockNumber_lte?: number;

  @TypeGraphQLField(() => [Int], { nullable: true })
  blockNumber_in?: number[];

  @TypeGraphQLField(() => Int, { nullable: true })
  index_eq?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  index_gt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  index_gte?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  index_lt?: number;

  @TypeGraphQLField(() => Int, { nullable: true })
  index_lte?: number;

  @TypeGraphQLField(() => [Int], { nullable: true })
  index_in?: number[];

  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  params_json?: JsonObject;
}

@TypeGraphQLInputType()
export class SubstrateEventWhereUniqueInput {
  @TypeGraphQLField(() => ID)
  id?: string;
}

@TypeGraphQLInputType()
export class SubstrateEventCreateInput {
  @TypeGraphQLField()
  name!: string;

  @TypeGraphQLField({ nullable: true })
  section?: string;

  @TypeGraphQLField()
  method!: string;

  @TypeGraphQLField(() => GraphQLJSONObject)
  phase!: JsonObject;

  @TypeGraphQLField()
  blockNumber!: number;

  @TypeGraphQLField()
  index!: number;

  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  params?: JsonObject;
}

@TypeGraphQLInputType()
export class SubstrateEventUpdateInput {
  @TypeGraphQLField({ nullable: true })
  name?: string;

  @TypeGraphQLField({ nullable: true })
  section?: string;

  @TypeGraphQLField({ nullable: true })
  method?: string;

  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  phase?: JsonObject;

  @TypeGraphQLField({ nullable: true })
  blockNumber?: number;

  @TypeGraphQLField({ nullable: true })
  index?: number;

  @TypeGraphQLField(() => GraphQLJSONObject, { nullable: true })
  params?: JsonObject;
}

@ArgsType()
export class SubstrateEventWhereArgs extends PaginationArgs {
  @TypeGraphQLField(() => SubstrateEventWhereInput, { nullable: true })
  where?: SubstrateEventWhereInput;

  @TypeGraphQLField(() => SubstrateEventOrderByEnum, { nullable: true })
  orderBy?: SubstrateEventOrderByEnum;
}

@ArgsType()
export class SubstrateEventCreateManyArgs {
  @TypeGraphQLField(() => [SubstrateEventCreateInput])
  data!: SubstrateEventCreateInput[];
}

@ArgsType()
export class SubstrateEventUpdateArgs {
  @TypeGraphQLField() data!: SubstrateEventUpdateInput;
  @TypeGraphQLField() where!: SubstrateEventWhereUniqueInput;
}
