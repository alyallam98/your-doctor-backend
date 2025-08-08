import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PermissionDocument = Permission & Document;

@Schema({
  timestamps: true,
})
export class Permission {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  slug: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

export const permissionDBModel = MongooseModule.forFeature([
  {
    name: Permission.name,
    schema: PermissionSchema,
  },
]);
