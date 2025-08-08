import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { GraphqlExceptionFilter } from './graphqlExceptionFilter';

@Catch(GraphQLError)
export class GraphqlGlobalExceptionFilter implements ExceptionFilter {
  catch(exception: GraphQLError, host: ArgumentsHost) {
    if (exception instanceof GraphqlExceptionFilter) {
      return {
        errors: [
          {
            message: exception.message,
            category: exception.extensions?.category || 'INTERNAL_SERVER_ERROR',
            status: exception.extensions?.status || 500,
            success: false,
          },
        ],
      };
    }
  }
}
