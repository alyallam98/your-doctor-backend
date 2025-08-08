import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateAuditLogInput } from './inputs/create-audit-log.input';
import { AuditLogFilterInput } from './inputs/audit-log.filter.input';
import { Injectable, Logger } from '@nestjs/common';
import { AuditLogsResponseType } from './types/audit-log.response.type';
import { Types } from 'mongoose';

export interface AuditEventData {
  userId: string;
  action: string;
  resource: string;
  entryId?: string;
  ip?: string;
  userAgent?: string;
  meta?: Record<string, any>;
  timestamp: Date;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async logEvent(eventData: {
    userId: string;
    action: string;
    resource: string;
    entryId?: string;
    ip?: string;
    userAgent?: string;
    meta?: Record<string, any>;
    timestamp: Date;
  }): Promise<AuditLog | null> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const auditLog = await this.auditLogModel.create({
          userId: new Types.ObjectId(eventData.userId),
          action: eventData.action,
          resource: eventData.resource,
          entryId: eventData.entryId
            ? new Types.ObjectId(eventData.entryId)
            : undefined,
          ip: eventData.ip,
          userAgent: eventData.userAgent,
          meta: eventData.meta,
          // Let MongoDB handle createdAt/updatedAt timestamps
        });

        this.logger.log(
          `Event audit logged: ${eventData.action} on ${eventData.resource}`,
        );
        return auditLog;
      } catch (error) {
        attempt++;
        this.logger.error(`Audit attempt ${attempt} failed:`, error.message);

        if (attempt >= maxRetries) {
          this.logger.error('CRITICAL: Audit logging failed permanently', {
            eventData,
            error: error.message,
          });
          return null;
        } else {
          // Wait before retry with exponential backoff
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  }

  async findLogs({
    page,
    limit,
    filter,
  }: {
    page: number;
    limit: number;
    filter?: AuditLogFilterInput;
  }): Promise<AuditLogsResponseType> {
    const query: any = {};

    if (filter?.action) query.action = filter.action;
    if (filter?.resource) query.resource = filter.resource;
    if (filter?.userId) query.userId = filter.userId;
    if (filter?.entryId) query.entryId = filter.entryId;
    if (filter?.ip) query.ip = filter.ip;

    if (filter?.createdAtFrom || filter?.createdAtTo) {
      query.createdAt = {};
      if (filter.createdAtFrom) query.createdAt.$gte = filter.createdAtFrom;
      if (filter.createdAtTo) query.createdAt.$lte = filter.createdAtTo;
    }

    page = page && page > 0 ? page : 1;
    limit = limit && limit > 0 && limit <= 100 ? limit : 20;

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.auditLogModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      this.auditLogModel.countDocuments(query).exec(),
    ]);

    const lastPage = Math.ceil(total / limit) || 1;
    const currentPage = page > lastPage ? lastPage : page;
    const currentPageItemsCount = logs.length;
    const hasMorePages = currentPage < lastPage;

    return {
      data: logs as any,
      paginationDetails: {
        currentPageItemsCount,
        total,
        itemsPerPage: limit,
        currentPage,
        lastPage,
        hasMorePages,
      },
    };
  }
}
