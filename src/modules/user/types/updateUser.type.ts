import { Field, ObjectType } from '@nestjs/graphql';
import { UserDocument } from '../schemas/user.schema';

@ObjectType()
export class UpdateUserResponse {
  // @Field()
  // message: string;
  @Field()
  results: UserDocument;
}
