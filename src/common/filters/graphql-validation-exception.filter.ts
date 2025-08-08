import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';

@Catch(BadRequestException)
export class GraphqlValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext();

    const response = exception.getResponse();
    const message =
      typeof response === 'object' && response !== null && 'message' in response
        ? (response as any).message
        : response;

    throw new BadRequestException(message);
  }
}
