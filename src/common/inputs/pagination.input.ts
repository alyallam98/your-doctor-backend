// inputs/pagination.input.ts
import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, Min, Max } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
