import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { CreateRoleInput } from './create-role.input';

@InputType()
export class UpdateRoleInput extends PartialType(CreateRoleInput) {
  @Field(() => ID)
  id: string;
}
