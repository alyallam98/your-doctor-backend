import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RegisterResponse {
  @Field()
  message: string;
  @Field({ nullable: true })
  verificationCode?: string;
}
