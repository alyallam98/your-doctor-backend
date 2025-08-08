// role.module.ts
import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleResolver } from './role.resolver';
import { roleDBModule } from './schemas/role.schema';
import { RoleSeedService } from './role.seed';
import { UserDBModule } from '../user/schemas/user.schema';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [roleDBModule, UserDBModule, PermissionModule],
  providers: [RoleService, RoleResolver, RoleSeedService],
  exports: [RoleService, RoleSeedService],
})
export class RoleModule {}
