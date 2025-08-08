import { Module } from '@nestjs/common';
import { AuditLogDBModel } from './schemas/audit-log.schema';
import { AuditLogService } from './audit-log.service';
import { AuditLogResolver } from './audit-log.resolver';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuditEventListener } from './audit-event.listener';
import { AuditHelper } from './audit.helper';

@Module({
  imports: [AuditLogDBModel, EventEmitterModule.forRoot()],
  providers: [
    AuditLogService,
    AuditLogResolver,
    AuditEventListener,
    AuditHelper,
  ],
  exports: [AuditLogService, AuditLogResolver, AuditHelper],
})
export class AuditLogModule {}
