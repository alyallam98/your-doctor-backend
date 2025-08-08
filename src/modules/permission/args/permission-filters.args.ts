import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class PermissionFilterArgs {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  slug?: string;
}
