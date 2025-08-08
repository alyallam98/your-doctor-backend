// file.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class File extends Document {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalname: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  path: string;

  @Prop() // Optional: S3/Cloud storage URL
  url?: string;

  @Prop() // File hash for deduplication
  hash?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  uploadedBy: Types.ObjectId;

  @Prop({ default: 'active' })
  status: 'active' | 'deleted' | 'processing';

  @Prop({ type: Object })
  variants?: {
    thumbnail?: string;
    medium?: string;
    large?: string;
  };

  @Prop({ type: Object }) // Metadata extraction
  metadata?: Record<string, any>;
}

export const FileSchema = SchemaFactory.createForClass(File);

// Create indexes for performance
FileSchema.index({ hash: 1 }); // For deduplication
FileSchema.index({ uploadedBy: 1 }); // User files
FileSchema.index({ mimetype: 1 }); // File type queries
FileSchema.index({ createdAt: -1 }); // Recent files first
