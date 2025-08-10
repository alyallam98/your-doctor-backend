import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { CreatePermissionInput } from './inputs/create-permission.Input';
import { UpdatePermissionInput } from './inputs/update-permission.Input';
import { SlugService } from '../../common/slug/slug.service';

export interface PermissionFilter {
  resource?: string;
  action?: string;
  isActive?: boolean;
  search?: string;
}

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
    private readonly slugService: SlugService,
  ) {}

  async findAll(): Promise<PermissionDocument[]> {
    const query: any = {};

    // if (filter.resource) {
    //   query.resource = new RegExp(filter.resource, 'i');
    // }

    // if (filter.action) {
    //   query.action = new RegExp(filter.action, 'i');
    // }

    // if (filter.isActive !== undefined) {
    //   query.isActive = filter.isActive;
    // }

    // if (filter.search) {
    //   query.$or = [
    //     { name: new RegExp(filter.search, 'i') },
    //     { resource: new RegExp(filter.search, 'i') },
    //     { action: new RegExp(filter.search, 'i') },
    //     { description: new RegExp(filter.search, 'i') },
    //   ];
    // }

    return this.permissionModel
      .find(query)
      .sort({ resource: 1, action: 1 })
      .exec();
  }
  async findById(id: string): Promise<PermissionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid permission ID');
    }

    const permission = await this.permissionModel.findById(id).exec();
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async findByName(name: string): Promise<PermissionDocument | null> {
    return this.permissionModel.findOne({ name }).exec();
  }

  async findByIds(ids: string[]): Promise<PermissionDocument[]> {
    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
    return this.permissionModel.find({ _id: { $in: validIds } }).exec();
  }

  async create(input: CreatePermissionInput): Promise<PermissionDocument> {
    const nameExists = await this.permissionModel.exists({ name: input.name });
    if (nameExists) {
      throw new ConflictException(
        `Permission name "${input.name}" already exists`,
      );
    }

    const slug = this.slugService.generate(input.name, { separator: ':' });

    return this.permissionModel.create({
      ...input,
      slug,
    });
  }

  async update(
    id: string,
    input: UpdatePermissionInput,
  ): Promise<PermissionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid permission ID');
    }

    if (input.name) {
      const nameExists = await this.permissionModel.exists({
        name: input.name,
        _id: { $ne: id },
      });

      if (nameExists) {
        throw new ConflictException(
          `Permission name "${input.name}" already exists`,
        );
      }
    }

    const permission = await this.permissionModel
      .findByIdAndUpdate(id, input, { new: true })
      .exec();

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid permission ID');
    }

    const result = await this.permissionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Permission not found');
    }
  }
}
