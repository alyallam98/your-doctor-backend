import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateDoctorRequestInput } from './create-doctor-request.input';

@InputType()
export class UpdateDoctorRequestInput extends PartialType(
  CreateDoctorRequestInput,
) {}
