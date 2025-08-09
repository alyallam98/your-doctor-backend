import { Field, InputType } from '@nestjs/graphql';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';

@InputType()
export class CreateDoctorRequestInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String)
  @IsMongoId({
    message: 'Invalid specialization id',
  })
  @IsNotEmpty()
  specialization: string;

  @Field(() => String)
  @Matches(/^01[0-2,5][0-9]{8}$/, {
    message:
      'Phone number must start with 010, 011, 012, or 015 and be 11 digits long',
  })
  @IsNotEmpty()
  phone: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  message?: string;
}
