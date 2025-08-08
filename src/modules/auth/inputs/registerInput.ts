import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @Field()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @Field()
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Field()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
