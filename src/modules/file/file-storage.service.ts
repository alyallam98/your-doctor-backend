// file-storage.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createReadStream, createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import * as sharp from 'sharp';
import { File } from './schemas/file.schema';

@Injectable()
export class FileStorageService {
  private readonly uploadPath = 'uploads';
  private readonly maxFileSize = 50 * 1024 * 1024; // 50MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
    'application/pdf',
    'text/plain',
    'video/mp4',
    'audio/mpeg',
  ];

  constructor(@InjectModel(File.name) private fileModel: Model<File>) {
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists() {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(fileUpload: any, userId: string): Promise<File> {
    const { createReadStream, filename, mimetype } = await fileUpload;

    // Validate file
    // this.validateFile(filename, mimetype);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = `${timestamp}_${sanitizedName}`;
    const filepath = join(this.uploadPath, uniqueFilename);

    // Stream file to disk with hash calculation
    const hash = await this.saveFileWithHash(createReadStream(), filepath);

    // Check for duplicates
    const existingFile = await this.findByHash(hash);
    if (existingFile) {
      return existingFile;
    }

    const stats = require('fs').statSync(filepath);

    // Create file document
    const fileDoc = new this.fileModel({
      filename: uniqueFilename,
      originalname: filename,
      mimetype,
      size: stats.size,
      path: filepath,
      hash,
      uploadedBy: userId,
    });

    const savedFile = await fileDoc.save();

    // Process file asynchronously for optimizations
    this.processFileAsync(savedFile);

    return savedFile;
  }

  private async saveFileWithHash(
    stream: any,
    filepath: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      const writeStream = createWriteStream(filepath);

      stream
        .on('data', (chunk) => hash.update(chunk))
        .pipe(writeStream)
        .on('finish', () => resolve(hash.digest('hex')))
        .on('error', reject);
    });
  }

  private async processFileAsync(file: File) {
    try {
      // Generate image variants for images
      if (file.mimetype.startsWith('image/')) {
        await this.generateImageVariants(file);
      }

      // Extract metadata
      const metadata = await this.extractMetadata(file);

      // Update file document
      await this.fileModel.findByIdAndUpdate(file._id, {
        variants: file.variants,
        metadata,
      });
    } catch (error) {
      console.error('File processing error:', error);
    }
  }

  private async generateImageVariants(file: File) {
    const inputPath = file.path;
    const baseDir = join(this.uploadPath, 'variants', file._id.toString());

    if (!existsSync(baseDir)) {
      mkdirSync(baseDir, { recursive: true });
    }

    const variants = {};
    const sizes = {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 500, height: 500 },
      large: { width: 1200, height: 1200 },
    };

    for (const [name, size] of Object.entries(sizes)) {
      const outputPath = join(baseDir, `${name}.webp`);

      await sharp(inputPath)
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toFile(outputPath);

      variants[name] = outputPath;
    }

    file.variants = variants;
  }

  async findByHash(hash: string): Promise<File | null> {
    return this.fileModel.findOne({ hash, status: 'active' });
  }

  async findById(id: string): Promise<File | null> {
    return this.fileModel.findById(id);
  }

  async getUserFiles(userId: string, limit = 20, offset = 0): Promise<File[]> {
    return this.fileModel
      .find({ uploadedBy: userId, status: 'active' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
  }

  private validateFile(filename: string, mimetype: string) {
    if (!this.allowedMimeTypes.includes(mimetype)) {
      throw new BadRequestException('File type not allowed');
    }
  }

  private async extractMetadata(file: File): Promise<Record<string, any>> {
    // Implement metadata extraction based on file type
    const metadata: any = {
      extractedAt: new Date(),
    };

    if (file.mimetype.startsWith('image/')) {
      try {
        const imageInfo = await sharp(file.path).metadata();
        metadata.dimensions = {
          width: imageInfo.width,
          height: imageInfo.height,
        };
        metadata.format = imageInfo.format;
      } catch (error) {
        console.error('Image metadata extraction failed:', error);
      }
    }

    return metadata;
  }
}
