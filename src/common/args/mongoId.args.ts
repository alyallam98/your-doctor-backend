import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsMongoId } from 'class-validator';

@ArgsType()
export class MongoIdArg {
  @Field(() => ID)
  @IsMongoId({ message: 'Invalid MongoDB ObjectId' })
  id: string;
}
