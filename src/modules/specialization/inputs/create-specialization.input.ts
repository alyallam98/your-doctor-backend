import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateSpecializationInput {
  @Field(() => String)
  name: string;
}
