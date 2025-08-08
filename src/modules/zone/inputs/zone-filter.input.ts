import { InputType, Field, ID, Int } from '@nestjs/graphql';

@InputType()
export class ZoneFilterInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  active?: boolean;

  @Field(() => ID, { nullable: true })
  parentId?: string;
}
