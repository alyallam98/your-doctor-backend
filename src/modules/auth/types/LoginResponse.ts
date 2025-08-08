import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LoginResponse {
  @Field()
  access_token: string;
  @Field({ nullable: true })
  refresh_token: string;
}
