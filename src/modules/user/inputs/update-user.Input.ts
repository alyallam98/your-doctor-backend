import { InputType, PartialType } from '@nestjs/graphql';
import { CreateUserInput } from './ceate-user.Input';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}
