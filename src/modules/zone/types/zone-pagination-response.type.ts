import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PaginationDetails } from 'src/common/types/paginationDetails.type';
import { ZoneType } from './zone.type';

@ObjectType()
export class ZonePaginationResponse {
  @Field(() => [ZoneType])
  data: ZoneType[];

  @Field(() => PaginationDetails)
  paginationDetails: PaginationDetails;
}
