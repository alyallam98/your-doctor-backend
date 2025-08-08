import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class RoleFilterArgs {
  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  isDefault?: boolean;

  @Field({ nullable: true })
  search?: string;
}
