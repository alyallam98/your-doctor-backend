// file.types.ts
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class FileType {
  @Field(() => ID)
  id: string;

  @Field()
  filename: string;

  @Field()
  originalname: string;

  @Field()
  mimetype: string;

  @Field(() => Int)
  size: number;

  @Field()
  url: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class FileUploadResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => FileType, { nullable: true })
  file?: FileType;

  @Field({ nullable: true })
  message?: string;
}
