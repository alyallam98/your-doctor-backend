import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { File, FileSchema } from './schemas/file.schema';
import { FileStorageService } from './file-storage.service';
import { FileResolver } from './file.resolver';
import { FileServingController } from './file-serving.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  providers: [FileStorageService, FileResolver],
  controllers: [FileServingController],
  exports: [FileStorageService, MongooseModule],
})
export class FileModule {}
