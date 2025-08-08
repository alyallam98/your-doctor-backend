import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateRoleInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { defaultValue: [] })
  permissions: string[];

  @Field({ nullable: true }) createdBy?: string;
}
