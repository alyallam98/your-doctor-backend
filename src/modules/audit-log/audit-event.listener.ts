import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditLogService, AuditEventData } from './audit-log.service';

@Injectable()
export class AuditEventListener {
  private readonly logger = new Logger(AuditEventListener.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  @OnEvent('audit.log', { async: true })
  async handleAuditEvent(eventData: AuditEventData): Promise<void> {
    // Validate event data before processing
    if (!this.isValidEventData(eventData)) {
      this.logger.warn('Invalid audit event data received', { eventData });
      return;
    }

    try {
      this.logger.debug(
        `Processing audit event: ${eventData.action} on ${eventData.resource} by user ${eventData.userId}`,
      );

      await this.auditLogService.logEvent(eventData);
    } catch (error) {
      this.logger.error('Error handling audit event', {
        eventData,
        error: error.message,
        stack: error.stack,
      });
    }
  }

  private isValidEventData(eventData: any): eventData is AuditEventData {
    return (
      eventData &&
      typeof eventData.userId === 'string' &&
      typeof eventData.action === 'string' &&
      typeof eventData.resource === 'string' &&
      eventData.timestamp instanceof Date
    );
  }

  /**
   * Handle high-priority audit events (e.g., security-related)
   * These might need immediate processing or alerting
   */
  @OnEvent('audit.log.priority', { async: true })
  async handlePriorityAuditEvent(eventData: AuditEventData): Promise<void> {
    this.logger.warn(
      `PRIORITY AUDIT: ${eventData.action} on ${eventData.resource}`,
      {
        eventData,
      },
    );

    // Process immediately without going through retry mechanism
    // or send to a different queue/handler for urgent processing
    await this.auditLogService.logEvent(eventData);

    // Additional handling for priority events
    // e.g., send alerts, notifications, etc.
  }
}
