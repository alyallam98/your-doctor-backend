import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { GraphQLError } from 'graphql';
import { ERROR_MESSAGES } from '../../../common/constants/errorMessages';
import { ERROR_CODES } from '../../../common/constants/errorsCodes';
import { UserService } from '../../../modules/user/user.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    const token = this.extractTokenFromRequest(request);
    const clientType = request.headers['client-type'];

    if (!token) return false;

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret:
          clientType === 'Web'
            ? this.configService.get('refreshSecret')
            : this.configService.get('refreshExpiration'),
      });

      const isUserExists = await this.userService.getUser(payload.sub);

      if (!isUserExists) {
        throw new GraphQLError(ERROR_MESSAGES.USER_NOTFOUND, {
          extensions: {
            code: ERROR_CODES.AUTH.UNAUTHORIZED,
            http: { status: 401 },
          },
        });
      }

      if (isUserExists.tokenVersion !== payload.tokenVersion) {
        throw new GraphQLError(ERROR_MESSAGES.SESSION_EXPIRED, {
          extensions: {
            code: ERROR_CODES.AUTH.UNAUTHORIZED,
            http: { status: 401 },
          },
        });
      }

      request.user = payload;
      return true;
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: {
          code: ERROR_CODES.AUTH.UNAUTHORIZED,
          http: { status: 401 },
        },
      });
    }
  }
  private getRequest(context: ExecutionContext): Request {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
  private extractTokenFromRequest(req: Request): string | null {
    return (
      req.headers.authorization?.split(' ')[1] ||
      req.cookies?.['refresh_token'] ||
      null
    );
  }
}
