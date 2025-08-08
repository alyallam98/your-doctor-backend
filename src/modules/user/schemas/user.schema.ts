import { Field, InputType, ObjectType } from '@nestjs/graphql';
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
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  email: string;

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

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
export const UserDBModule = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
]);
