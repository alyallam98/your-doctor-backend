import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsMongoId,
} from 'class-validator';

@InputType()
export class CreateDoctorInput {
  @Field()
  @IsOptional()
  @MaxLength(50)
  name: string;

  @Field()
  @IsNotEmpty({ message: 'username is required' })
  username: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
  })
  password: string;
}
