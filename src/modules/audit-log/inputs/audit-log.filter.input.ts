import { InputType, Field, ID } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType()
export class AuditLogFilterInput {
  @Field({ nullable: true })
  action?: string;

  @Field({ nullable: true })
  resource?: string;

  @Field(() => ID, { nullable: true })
  userId?: Types.ObjectId;

  @Field(() => ID, { nullable: true })
  entryId?: Types.ObjectId;

  @Field({ nullable: true })
  ip?: string;

  @Field(() => Date, { nullable: true })
  createdAtFrom?: Date;

  @Field(() => Date, { nullable: true })
  createdAtTo?: Date;
}
