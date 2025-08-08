import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class PaginationDetails {
  @Field(() => Int)
  currentPageItemsCount: number;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  itemsPerPage: number;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  lastPage: number;

  @Field(() => Boolean)
  hasMorePages: boolean;
}
