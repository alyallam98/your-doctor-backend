// doctor-request-status.enum.ts
import { registerEnumType } from '@nestjs/graphql';

export enum DoctorRequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

registerEnumType(DoctorRequestStatus, {
  name: 'DoctorRequestStatus', // Name in GraphQL schema
  description: 'The status of a doctor request',
});

// update-doctor-request.input.ts
import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';

@InputType()
export class UpdateDoctorRequestInput {
  @Field(() => DoctorRequestStatus, { nullable: true })
  @IsOptional()
  @IsEnum(DoctorRequestStatus)
  status?: DoctorRequestStatus;
}
