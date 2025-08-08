// file-serving.controller.ts
import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { FileStorageService } from './file-storage.service';

@Controller('files')
export class FileServingController {
  constructor(private fileStorageService: FileStorageService) {}

  @Get(':id')
  async serveFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.fileStorageService.findById(id);

    if (!file || !existsSync(file.path)) {
      throw new NotFoundException('File not found');
    }

    // Set appropriate headers
    res.set({
      'Content-Type': file.mimetype,
      'Content-Length': file.size.toString(),
      'Cache-Control': 'public, max-age=31536000', // 1 year cache
      ETag: file.hash,
    });

    const stream = createReadStream(file.path);
    return new StreamableFile(stream);
  }

  @Get(':id/thumbnail')
  async serveThumbnail(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.fileStorageService.findById(id);

    if (!file?.variants?.thumbnail || !existsSync(file.variants.thumbnail)) {
      throw new NotFoundException('Thumbnail not found');
    }

    res.set({
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000',
    });

    const stream = createReadStream(file.variants.thumbnail);
    return new StreamableFile(stream);
  }
}
