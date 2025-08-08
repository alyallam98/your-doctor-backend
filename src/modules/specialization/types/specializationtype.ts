import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SpecializationType {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
