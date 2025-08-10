// role.resolver.ts
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { RoleService } from './role.service';
import { CreateRoleInput } from './inputs/create-role.input';
import { UpdateRoleInput } from './inputs/update-role.input';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RoleType } from './types/role.type';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { PermissionsDecorator } from '../../common/decorators/permissions.decorator';

@UseGuards(GqlAuthGuard, RolesGuard, PermissionsGuard)
@Resolver(() => RoleType)
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}

  @Query(() => [RoleType])
  @PermissionsDecorator('role:view')
  async roles() {
    return this.roleService.findAll();
  }

  @Query(() => [RoleType])
  async rolesDropdown() {
    return this.roleService.rolesDropdown();
  }
  @Query(() => RoleType)
  async getDefaultRole() {
    return this.roleService.getDefaultRole();
  }

  @Query(() => RoleType, { nullable: true })
  @PermissionsDecorator('role:view')
  async role(@Args('id', { type: () => ID }) id: string) {
    return this.roleService.findById(id);
  }

  @Mutation(() => RoleType)
  @PermissionsDecorator('role:create')
  async createRole(@Args('input') input: CreateRoleInput) {
    return this.roleService.create(input);
  }

  @Mutation(() => RoleType)
  @PermissionsDecorator('role:update')
  async updateRole(@Args('input') input: UpdateRoleInput) {
    return this.roleService.update(input);
  }

  @Mutation(() => Boolean)
  @PermissionsDecorator('role:delete')
  async deleteRole(@Args('id', { type: () => ID }) id: string) {
    return this.roleService.delete(id);
  }

  @Mutation(() => RoleType)
  async assignPermissionsToRole(
    @Args('roleId', { type: () => ID }) roleId: string,
    @Args({ name: 'permissionIds', type: () => [ID] }) permissionIds: string[],
  ) {
    return this.roleService.assignPermissionsToRole(roleId, permissionIds);
  }

  @Mutation(() => RoleType)
  async toggleRoleActivationStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('isActive') isActive: boolean,
  ) {
    return this.roleService.toggleRoleActivationStatus(id, isActive);
  }
}

// ToDo getRolePermission
