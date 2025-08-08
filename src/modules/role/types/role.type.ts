import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { PermissionType } from 'src/modules/permission/types/permission.type';

@ObjectType()
export class RoleType {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isDefault: boolean;

  @Field()
  isActive: boolean;

  @Field()
  isCanDelete: boolean;

  @Field(() => [PermissionType], { nullable: true })
  permissions?: PermissionType[];

  @Field()
  usersCount: number;

  @Field(() => Int)
  permissionsCount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  createdBy: string;
}
