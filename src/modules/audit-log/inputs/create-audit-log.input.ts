import { InputType, Field, ID } from '@nestjs/graphql';
import { Types } from 'mongoose';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateAuditLogInput {
  @Field()
  action: string;

  @Field()
  resource: string;

  @Field(() => ID, { nullable: true })
  userId?: Types.ObjectId;

  @Field(() => ID, { nullable: true })
  entryId?: Types.ObjectId;

  @Field({ nullable: true })
  ip?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  meta?: Record<string, any>;
}
