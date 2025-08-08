import { PaginationDetails } from 'src/common/types/PaginationDetails.type';
import { AuditLogType } from './audit-log.type';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuditLogsResponseType {
  @Field(() => [AuditLogType])
  data: AuditLogType[];

  @Field(() => PaginationDetails)
  paginationDetails: PaginationDetails;
}
