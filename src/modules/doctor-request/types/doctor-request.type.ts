import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DoctorRequestType {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field()
  Specialization: string;

  @Field()
  phone: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
