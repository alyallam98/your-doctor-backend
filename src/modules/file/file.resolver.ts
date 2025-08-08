// file.resolver.ts
import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { FileStorageService } from './file-storage.service';
import { FileType, FileUploadResponse } from './types/file.types';

@Resolver(() => FileType)
// @UseGuards(AuthGuard)
export class FileResolver {
  constructor(private fileStorageService: FileStorageService) {}

  @Mutation(() => FileUploadResponse)
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
    @Context() context: any,
  ): Promise<FileUploadResponse> {
    try {
      console.log({ file });
      // const userId = context.user.id;
      const uploadedFile = await this.fileStorageService.uploadFile(
        file,
        'userId',
      );

      return {
        success: true,
        file: {
          ...uploadedFile.toObject(),
          id: uploadedFile._id.toString(),
          url: `/files/${uploadedFile._id}`,
          thumbnailUrl: uploadedFile.variants?.thumbnail
            ? `/files/${uploadedFile._id}/thumbnail`
            : null,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Query(() => [FileType])
  async getUserFiles(
    @Args('limit', { defaultValue: 20 }) limit: number,
    @Args('offset', { defaultValue: 0 }) offset: number,
    @Context() context: any,
  ): Promise<FileType[]> {
    const userId = context.user.id;
    const files = await this.fileStorageService.getUserFiles(
      userId,
      limit,
      offset,
    );

    return files.map((file) => ({
      ...file.toObject(),
      id: file._id.toString(),
      url: `/files/${file._id}`,
      thumbnailUrl: file.variants?.thumbnail
        ? `/files/${file._id}/thumbnail`
        : null,
    }));
  }
}
