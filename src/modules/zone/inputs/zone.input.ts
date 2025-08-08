import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateZoneInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  active?: boolean;

  @Field(() => ID, { nullable: true })
  parentId?: string;
}
