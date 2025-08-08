import { Field, ObjectType } from '@nestjs/graphql';
import { LoginResponse } from './LoginResponse';

@ObjectType()
export class ChangePasswordResponse extends LoginResponse {}
