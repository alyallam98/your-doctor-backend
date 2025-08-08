import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Zone extends Document {
  @Prop({ required: true, type: Object })
  name: Record<string, string>;

  @Prop({ required: true, type: Object })
  slug: Record<string, string>;

  @Prop({ default: true })
  active: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Zone', default: null })
  parentId?: string;

  children?: Zone[];
}

export const ZoneSchema = SchemaFactory.createForClass(Zone);

ZoneSchema.virtual('children', {
  ref: 'Zone',
  localField: '_id',
  foreignField: 'parentId',
});

export type ZoneDocument = Zone & Document;
export const zoneDBModel = MongooseModule.forFeature([
  { name: 'Zone', schema: ZoneSchema },
]);
