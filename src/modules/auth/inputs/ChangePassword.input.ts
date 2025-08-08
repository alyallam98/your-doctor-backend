import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(30, { message: 'New password must not exceed 30 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
    message:
      'Password must contain at least 1 uppercase letter, 1 number, and 1 special character',
  })
  newPassword: string;
  @Field()
  @IsNotEmpty({ message: 'Old password is required' })
  oldPassword: string;
}
