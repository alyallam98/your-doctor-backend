import { GraphQLError } from 'graphql';

// Define an interface for the constructor parameters
interface GraphqlExceptionFilterParams {
  message: string;
  status: number;
  category: string;
}

export class GraphqlExceptionFilter extends GraphQLError {
  constructor({ message, status, category }: GraphqlExceptionFilterParams) {
    // Create the error without extensions initially
    super(message);

    // Add custom extensions after creating the error
    Object.assign(this, {
      extensions: {
        category,
        status,
      },
    });

    // Optionally, remove the stacktrace in production
    if (process.env.NODE_ENV === 'production') {
      delete this.extensions.stacktrace;
    }
  }
}
