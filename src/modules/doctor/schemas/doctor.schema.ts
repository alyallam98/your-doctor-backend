import { Field, ObjectType } from '@nestjs/graphql';
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@ObjectType()
export class VerificationCode {
  @Prop({ required: true })
  @Field()
  code: string;

  @Prop({ type: Date, required: true })
  @Field()
  expiresAt: Date;
}

@Schema({ timestamps: true, versionKey: false })
export class Doctor {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: 0 })
  tokenVersion: number;

  @Prop({ default: null })
  profilePicture?: string;

  @Prop({ required: true, default: false })
  isVerified: boolean;

  @Prop({ type: () => VerificationCode })
  verificationCode: VerificationCode;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role: string;
}

export type DoctorDocument = Doctor & Document;
export const DoctorSchema = SchemaFactory.createForClass(Doctor);
export const doctorDBModule = MongooseModule.forFeature([
  { name: Doctor.name, schema: DoctorSchema },
]);
