// role.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateRoleInput } from './inputs/create-role.input';
import { Role, RoleDocument } from './schemas/role.schema';
import { UpdateRoleInput } from './inputs/update-role.input';
import { RoleFilterArgs } from './args/role-filters.args';
import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(User.name) private useModel: Model<UserDocument>,
  ) {}

  async create(input: CreateRoleInput): Promise<Role> {
    const existingRole = await this.roleModel.findOne({ name: input.name });
    if (existingRole) {
      throw new ConflictException(
        `Role with name "${input.name}" already exists.`,
      );
    }

    return await this.roleModel.create(input);
  }

  async findAll(filter: RoleFilterArgs = {}): Promise<RoleDocument[]> {
    const query: any = {};

    if (filter.isActive !== undefined) {
      query.isActive = filter.isActive;
    }

    if (filter.isDefault !== undefined) {
      query.isDefault = filter.isDefault;
    }

    if (filter.search) {
      query.$or = [
        { name: new RegExp(filter.search, 'i') },
        { displayName: new RegExp(filter.search, 'i') },
        { description: new RegExp(filter.search, 'i') },
      ];
    }

    // => $match like find(query)
    const roles = await this.roleModel.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'employees', // Collection name in MongoDB (usually lowercase plural)
          localField: '_id',
          foreignField: 'role',
          as: 'employees',
        },
      },
      {
        $addFields: {
          usersCount: { $size: '$employees' },
          permissionsCount: { $size: '$permissions' },
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          isActive: 1,
          isDefault: 1,
          permissionsCount: 1,
          usersCount: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      // {
      //   $sort: { createdAt: 1 },
      // },
    ]);

    return roles;
  }

  async findOne(name: string): Promise<RoleDocument> {
    const role = await this.roleModel.findOne({ name }).lean();
    // if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async findById(
    id: string,
  ): Promise<Role & { usersCount: number; permissionsCount: number }> {
    const role = await this.roleModel
      .findById(id)
      .populate({
        path: 'permissions',
        model: 'Permission',
      })
      .lean();

    // console.log({ role });
    // if (!role) throw new NotFoundException('Role not found');

    const usersCount = await this.useModel.countDocuments({ role: role._id });

    return { ...role, usersCount, permissionsCount: role.permissions.length };
  }

  async rolesDropdown(): Promise<RoleDocument[]> {
    const roles = await this.roleModel
      .find({
        name: { $ne: 'user' },
      })
      .lean();
    return roles;
  }

  async getDefaultRole(): Promise<RoleDocument> {
    const role = await this.roleModel.findOne({ isDefault: true }).exec();
    return role;
  }

  async update(input: UpdateRoleInput): Promise<Role> {
    const existingRole = await this.roleModel.findOne({
      name: input.name,
      _id: { $ne: input.id },
    });

    if (existingRole) {
      throw new ConflictException(
        `Role with name "${input.name}" already exists.`,
      );
    }

    const updated = await this.roleModel
      .findByIdAndUpdate(input.id, input, { new: true, runValidators: true })
      .lean();

    if (!updated) {
      throw new NotFoundException('Role not found');
    }

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const role = await this.roleModel.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    if (role.isDefault)
      throw new BadRequestException('Cannot delete default role');

    await this.roleModel.findByIdAndDelete(id);
    return true;
  }

  async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const updatedRole = await this.roleModel
      .findByIdAndUpdate(roleId, { permissions: permissionIds }, { new: true })
      .populate('permissions');

    if (!updatedRole) {
      throw new NotFoundException('Role not found');
    }

    return updatedRole;
  }

  async toggleRoleActivationStatus(
    id: string,
    isActive: boolean,
  ): Promise<Role> {
    const role = await this.roleModel.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    if (role.isDefault && !isActive)
      throw new BadRequestException('Cannot deactivate default role');

    const updated = await this.roleModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    );
    return updated;
  }
}
