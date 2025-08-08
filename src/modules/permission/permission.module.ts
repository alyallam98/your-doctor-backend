import { Module } from '@nestjs/common';
import { permissionDBModel } from './schemas/permission.schema';
import { PermissionService } from './permission.service';
import { PermissionSeedService } from './permission.seed';
import { PermissionResolver } from './permission.resolver';

@Module({
  imports: [permissionDBModel],
  providers: [PermissionService, PermissionSeedService, PermissionResolver],
  exports: [PermissionService, PermissionSeedService, permissionDBModel],
})
export class PermissionModule {}
