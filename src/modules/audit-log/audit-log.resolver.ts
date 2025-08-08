import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { AuditLogType } from './types/audit-log.type';
import { AuditLogFilterInput } from './inputs/audit-log.filter.input';
import { AuditLogsResponseType } from './types/audit-log.response.type';
import { AuditLogService } from './audit-log.service';

@Resolver(() => AuditLogType)
export class AuditLogResolver {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Query(() => AuditLogsResponseType)
  async auditLogs(
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
    @Args('filter', { nullable: true }) filter?: AuditLogFilterInput,
  ): Promise<AuditLogsResponseType> {
    return this.auditLogService.findLogs({ limit, page, filter });
  }
}
