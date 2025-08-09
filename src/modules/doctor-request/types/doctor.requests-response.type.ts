// doctor-request-pagination.type.ts
import { Field, ObjectType, Int } from '@nestjs/graphql';
import { DoctorRequestType } from './doctor-request.type';
import { PaginationDetails } from 'src/common/types/paginationDetails.type';

@ObjectType()
export class DoctorRequestsResponse {
  @Field(() => [DoctorRequestType])
  data: DoctorRequestType[];

  @Field(() => PaginationDetails)
  paginationDetails: PaginationDetails;
}
