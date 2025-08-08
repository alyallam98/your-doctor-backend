import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Specialization {
  @Prop({ required: true, type: Object })
  name: Record<string, string>;

  @Prop({ required: true, type: Object })
  slug: Record<string, string>;
}

export type SpecializationDocument = Specialization & Document;

export const SpecializationSchema =
  SchemaFactory.createForClass(Specialization);

export const specializationDBModel = MongooseModule.forFeature([
  {
    name: Specialization.name,
    schema: SpecializationSchema,
  },
]);
