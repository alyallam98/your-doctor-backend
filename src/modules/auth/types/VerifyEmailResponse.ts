import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VerifyEmailResponse {
  @Field()
  message: string;
  @Field()
  success: boolean;
}
