import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PermissionService } from './permission.service';

import { CreatePermissionInput } from './inputs/create-permission.Input';
import { UpdatePermissionInput } from './inputs/update-permission.Input';
import { PermissionFilterArgs } from './args/permission-filters.args';
import { Permission } from './schemas/permission.schema';
import { PermissionType } from './types/permission.type';

@Resolver(() => PermissionType)
export class PermissionResolver {
  constructor(private readonly permissionService: PermissionService) {}

  @Mutation(() => PermissionType)
  async createPermission(
    @Args('input') input: CreatePermissionInput,
  ): Promise<Permission> {
    return this.permissionService.create(input);
  }

  @Query(() => [PermissionType])
  async permissions(): Promise<Permission[]> {
    return this.permissionService.findAll();
  }

  @Query(() => PermissionType)
  async permission(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Permission> {
    return this.permissionService.findById(id);
  }

  @Query(() => PermissionType, { nullable: true })
  async permissionByName(
    @Args('name') name: string,
  ): Promise<Permission | null> {
    return this.permissionService.findByName(name);
  }

  @Query(() => [PermissionType])
  async permissionsByIds(
    @Args({ name: 'ids', type: () => [ID] }) ids: string[],
  ): Promise<Permission[]> {
    return this.permissionService.findByIds(ids);
  }

  @Mutation(() => PermissionType)
  async updatePermission(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePermissionInput,
  ): Promise<Permission> {
    return this.permissionService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deletePermission(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.permissionService.remove(id);
    return true;
  }
}
