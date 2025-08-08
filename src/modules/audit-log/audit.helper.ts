import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface AuditContext {
  userId: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string; // For tracing
}

export interface AuditData {
  entryId?: string;
  meta?: Record<string, any>;
  previousValues?: Record<string, any>; // For UPDATE operations
  newValues?: Record<string, any>; // For UPDATE operations
}

// Standard audit actions
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  ARCHIVE = 'ARCHIVE',
  RESTORE = 'RESTORE',
}

// Standard resources
export enum AuditResource {
  USER = 'USER',
  ROLE = 'ROLE',
  BRANCH = 'BRANCH',
  PRODUCT = 'PRODUCT',
  ORDER = 'ORDER',
  SETTING = 'SETTING',
  REPORT = 'REPORT',
}

/*
`

Example on how to use helpers
// In a controller/service
@Injectable()
export class UserService {
  constructor(
    private auditHelper: AuditHelper,
    // ... other dependencies
  ) {}

  async updateUser(id: string, updateData: any, req: any) {
    const user = await this.userModel.findById(id);
    const previousValues = { name: user.name, email: user.email };
    
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData);
    
    // Enhanced audit logging
    const context = this.auditHelper.createContextFromRequest(req, req.user.id);
    this.auditHelper.logUpdate(AuditResource.USER, context, {
      entryId: id,
      previousValues,
      newValues: updateData,
      meta: { updateReason: 'Profile update' }
    });
    
    return updatedUser;
  }

  async bulkDeleteUsers(userIds: string[], req: any) {
    await this.userModel.deleteMany({ _id: { $in: userIds } });
    
    const context = this.auditHelper.createContextFromRequest(req, req.user.id);
    this.auditHelper.logBulk('DELETE', AuditResource.USER, context, userIds);
  }
}
`
*/
@Injectable()
export class AuditHelper {
  private readonly logger = new Logger(AuditHelper.name);

  constructor(private eventEmitter: EventEmitter2) {}

  /**
   * Log an audit event with enhanced validation and structure
   */
  log(
    action: AuditAction | string,
    resource: AuditResource | string,
    context: AuditContext,
    data?: AuditData,
  ): void {
    // Validate required fields
    if (!action || !resource || !context.userId) {
      this.logger.error('Invalid audit log parameters', {
        action,
        resource,
        userId: context.userId,
      });
      return;
    }

    const auditEvent = {
      userId: context.userId,
      action: typeof action === 'string' ? action.toUpperCase() : action,
      resource:
        typeof resource === 'string' ? resource.toUpperCase() : resource,
      entryId: data?.entryId,
      ip: context.ip,
      userAgent: context.userAgent,
      meta: {
        ...data?.meta,
        sessionId: context.sessionId,
        requestId: context.requestId,
        previousValues: data?.previousValues,
        newValues: data?.newValues,
      },
      timestamp: new Date(),
    };

    // Emit the event asynchronously
    try {
      this.eventEmitter.emit('audit.log', auditEvent);
    } catch (error) {
      this.logger.error('Failed to emit audit event', {
        auditEvent,
        error: error.message,
      });
    }
  }

  // Enhanced convenience methods with better typing
  logCreate(
    resource: AuditResource | string,
    context: AuditContext,
    data?: Omit<AuditData, 'previousValues'>,
  ): void {
    this.log(AuditAction.CREATE, resource, context, data);
  }

  logUpdate(
    resource: AuditResource | string,
    context: AuditContext,
    data?: AuditData,
  ): void {
    this.log(AuditAction.UPDATE, resource, context, data);
  }

  logDelete(
    resource: AuditResource | string,
    context: AuditContext,
    data?: Omit<AuditData, 'newValues'>,
  ): void {
    this.log(AuditAction.DELETE, resource, context, data);
  }

  logView(
    resource: AuditResource | string,
    context: AuditContext,
    data?: Pick<AuditData, 'entryId' | 'meta'>,
  ): void {
    this.log(AuditAction.VIEW, resource, context, data);
  }

  logAuth(action: 'LOGIN' | 'LOGOUT', context: AuditContext): void {
    this.log(action, 'AUTH', context);
  }

  logExport(
    resource: AuditResource | string,
    context: AuditContext,
    data?: { format?: string; filters?: any; recordCount?: number },
  ): void {
    this.log(AuditAction.EXPORT, resource, context, {
      meta: data,
    });
  }

  logImport(
    resource: AuditResource | string,
    context: AuditContext,
    data?: { format?: string; recordCount?: number; errors?: any[] },
  ): void {
    this.log(AuditAction.IMPORT, resource, context, {
      meta: data,
    });
  }

  /**
   * Bulk audit logging for batch operations
   */
  logBulk(
    action: AuditAction | string,
    resource: AuditResource | string,
    context: AuditContext,
    entryIds: string[],
    meta?: Record<string, any>,
  ): void {
    this.log(action, resource, context, {
      meta: {
        ...meta,
        bulkOperation: true,
        affectedIds: entryIds,
        count: entryIds.length,
      },
    });
  }

  /**
   * Create audit context from request object (if using Express/Fastify)
   */
  createContextFromRequest(req: any, userId: string): AuditContext {
    return {
      userId,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get?.('User-Agent') || req.headers?.['user-agent'],
      sessionId: req.session?.id || req.sessionID,
      requestId: req.id || req.headers?.['x-request-id'],
    };
  }
}
