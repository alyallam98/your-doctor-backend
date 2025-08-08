// src/common/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const PermissionsDecorator = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
