import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Specialization } from '../../../modules/specialization/schemas/specialization.schema';
import { SpecializationType } from '../../../modules/specialization/types/specializationtype';

@ObjectType()
export class DoctorRequestType {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field(() => SpecializationType)
  specialization: Specialization;

  @Field()
  phone: string;

  @Field()
  status: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
