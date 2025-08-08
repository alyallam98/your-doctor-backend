import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class EmployeeLoginInput {
  @Field(() => String)
  username: string;

  @Field(() => String)
  password: string;
}
