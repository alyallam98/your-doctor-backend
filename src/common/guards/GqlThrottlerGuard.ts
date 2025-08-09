import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(GqlThrottlerGuard.name);

  getRequestResponse(context: ExecutionContext) {
    this.logger.debug(`Context type: ${context.getType<'graphql'>()}`);

    if (context.getType<'graphql'>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context).getContext();
      this.logger.debug(`GraphQL context keys: ${Object.keys(gqlCtx)}`);
      this.logger.debug(`GraphQL req exists: ${!!gqlCtx.req}`);
      return { req: gqlCtx?.req ?? {}, res: gqlCtx?.res ?? {} };
    }

    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest();
    const res = httpCtx.getResponse();
    this.logger.debug(`HTTP request type: ${typeof req}`);
    return { req, res };
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    this.logger.debug(
      `getTracker called with req keys: ${Object.keys(req || {})}`,
    );

    const ip =
      req.ip ??
      req.headers?.['x-forwarded-for'] ??
      req.connection?.remoteAddress ??
      'unknown';

    this.logger.debug(`Resolved IP: ${ip}`);
    return ip;
  }
}
