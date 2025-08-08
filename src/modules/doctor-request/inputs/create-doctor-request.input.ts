import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateDoctorRequestInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  Specialization: string;

  @Field(() => String)
  phone: string;

  @Field(() => String, { nullable: true })
  message?: string;
}
