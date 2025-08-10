import { Injectable, Logger } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PERMISSIONS } from '../../common/constants/permissions';

@Injectable()
export class PermissionSeedService {
  private readonly logger = new Logger(PermissionSeedService.name);

  constructor(private readonly permissionService: PermissionService) {}

  async seedDefaultPermissions() {
    for (const [resource, perms] of Object.entries(PERMISSIONS)) {
      for (const permission of perms) {
        const existing = await this.permissionService
          .findByName(permission.name)
          .catch(() => null);

        if (!existing) {
          await this.permissionService.create(permission);
          this.logger.log(
            `Seeded permission: ${permission.name} (${resource})`,
          );
        }
      }
    }
  }
}
