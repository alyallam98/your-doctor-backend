import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdatePermissionInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  resource?: string;

  @Field({ nullable: true })
  action?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  isActive?: boolean;
}
