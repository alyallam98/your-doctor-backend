import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Types } from 'mongoose';

@ObjectType()
export class AuditLogType {
  @Field(() => ID)
  id: string; // MongoDB ObjectId as string

  @Field()
  action: string; // 'create', 'update', 'delete'

  @Field()
  resource: string; // 'user', 'role', 'branch'

  @Field(() => ID, { nullable: true })
  userId?: Types.ObjectId;

  @Field(() => ID, { nullable: true })
  entryId?: Types.ObjectId;

  @Field({ nullable: true })
  ip?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field(() => String, { nullable: true })
  meta?: any; // or JSON scalar type if you use @nestjs/graphql Scalars
}
