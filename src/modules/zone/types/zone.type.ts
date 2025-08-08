import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Zone } from '../schemas/zone.schema';

@ObjectType()
export class ZoneType {
  @Field(() => ID)
  _id: string;

  @Field()
  name: string;

  @Field()
  active: boolean;

  @Field(() => ZoneType, { nullable: true })
  parentId?: Zone;

  @Field(() => [ZoneType], { nullable: 'items' })
  children?: Zone[];
}
