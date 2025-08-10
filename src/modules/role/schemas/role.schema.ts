import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { Permission } from '../../../modules/permission/schemas/permission.schema';

@Schema({ timestamps: true, versionKey: false })
export class Role {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Permission' }] })
  permissions: Types.ObjectId[];

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isCanDelete: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  createdBy: Types.ObjectId;
}

export type RoleDocument = Role & Document;
export const RoleSchema = SchemaFactory.createForClass(Role);
export const roleDBModule = MongooseModule.forFeature([
  {
    name: Role.name,
    schema: RoleSchema,
  },
]);
