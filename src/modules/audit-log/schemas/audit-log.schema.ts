import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true, versionKey: false })
export class AuditLog {
  @Prop({ required: true })
  action: string; // 'create', 'update', 'delete'

  @Prop({ required: true })
  resource: string; // 'user', 'role', 'branch'

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId; // Who did the action

  @Prop({ type: Types.ObjectId })
  entryId?: Types.ObjectId; // The ID of the target entity being affected (user, branch, role, etc.)

  @Prop()
  ip?: string; // IP address

  @Prop()
  userAgent?: string; // Browser / OS / Device info

  @Prop({ type: Object, default: {} })
  meta?: Record<string, any>; // Optional additional info
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

export const AuditLogDBModel = MongooseModule.forFeature([
  {
    name: 'AuditLog',
    schema: AuditLogSchema,
  },
]);
