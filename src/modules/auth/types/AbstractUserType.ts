import { Field, ID, InterfaceType, ObjectType } from '@nestjs/graphql';
import { RoleType } from '../../../modules/role/types/role.type';

@InterfaceType()
export abstract class AbstractUserType {
  @Field(() => ID)
  _id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => RoleType)
  role: RoleType;
}
