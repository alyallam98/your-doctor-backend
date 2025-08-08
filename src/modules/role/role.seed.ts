// src/modules/role/role.seed.ts
import { Injectable, Logger } from '@nestjs/common';
import { RoleService } from './role.service';
import {
  PERMISSIONS,
  PERMISSIONS_CODES,
} from 'src/common/constants/permissions';
import { PermissionService } from '../permission/permission.service';

@Injectable()
export class RoleSeedService {
  private readonly logger = new Logger(RoleSeedService.name);

  constructor(
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
  ) {}

  async seedDefaultRoles() {
    const allPermissions = await this.permissionService.findAll();

    const getPermissionIdsByCodes = (codes: string[]) => {
      return allPermissions
        .filter((perm) => codes.includes(perm.slug))
        .map((perm) => perm._id);
    };

    const getAllPermissionIds = () => allPermissions.map((p) => p._id);

    const defaultRoles = [
      {
        name: 'user',
        description: 'Standard user with limited permissions',
        permissions: [],
        isDefault: true,
        isActive: true,
        isCanDelete: false,
      },
      {
        name: 'admin',
        description: 'Administrator with full permissions',
        permissions: ['*'],
        isDefault: false,
        isActive: true,
        isCanDelete: false,
      },
      {
        name: 'sales',
        description: 'Sales role with full permissions',
        permissions: [PERMISSIONS_CODES.category.read], //category:read
        isDefault: false,
        isActive: true,
        isCanDelete: false,
      },
    ];

    for (const role of defaultRoles) {
      const existingRole = await this.roleService
        .findOne(role.name)
        .catch(() => null);

      if (!existingRole) {
        const resolvedPermissions = role.permissions.includes('*')
          ? getAllPermissionIds()
          : getPermissionIdsByCodes(role.permissions);

        await this.roleService.create({
          ...role,
          permissions: resolvedPermissions as string[],
          createdBy: 'system',
        });

        this.logger.log(`Seeded default role: ${role.name}`);
      }
    }
  }
}
