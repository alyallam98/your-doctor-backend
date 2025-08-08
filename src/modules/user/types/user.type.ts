import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { VerificationCode } from '../schemas/user.schema';
import { RoleType } from 'src/modules/role/types/role.type';

@ObjectType()
export class UserType {
  @Field(() => ID)
  _id: unknown;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => Int)
  tokenVersion: number;

  @Field()
  profilePicture?: string;

  @Field()
  isVerified: boolean;

  @Field(() => VerificationCode)
  verificationCode: VerificationCode;

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  deletedAt?: Date | null;

  @Field(() => RoleType)
  role: RoleType;
}
