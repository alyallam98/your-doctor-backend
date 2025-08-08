import { InputType, PartialType } from '@nestjs/graphql';
import { CreateDoctorInput } from './create-doctor.Input';

@InputType()
export class UpdateDoctorInput extends PartialType(CreateDoctorInput) {}
