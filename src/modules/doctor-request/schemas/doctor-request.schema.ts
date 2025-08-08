// src/modules/role/schemas/role.schema.ts
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export enum DoctorRequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true, versionKey: false })
export class DoctorRequest {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'specialization' })
  Specialization: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  message: string;

  @Prop({
    type: String,
    enum: DoctorRequestStatus,
    default: DoctorRequestStatus.PENDING,
  })
  status: DoctorRequestStatus;
}

export type DoctorRequestDocument = DoctorRequest & Document;
export const RoleSchema = SchemaFactory.createForClass(DoctorRequest);
export const doctorRequestDBModule = MongooseModule.forFeature([
  {
    name: DoctorRequest.name,
    schema: RoleSchema,
  },
]);
