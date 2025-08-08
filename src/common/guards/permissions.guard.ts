// src/common/guards/permissions.guard.ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { GraphQLError } from 'graphql';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permission required
    }

    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    const userPermissions = user?.role?.permissions?.map((p: any) => p.slug);

    console.log({ user, userPermissions, requiredPermissions });

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new GraphQLError('Insufficient permissions', {
        extensions: {
          code: 'FORBIDDEN',
          category: 'PERMISSIONS',
        },
      });
    }

    return true;
  }
}
