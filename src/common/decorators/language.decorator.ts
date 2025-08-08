// src/common/decorators/language.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Extract language from x-lang header in both REST and GraphQL contexts
 */
export const Language = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    // Check if it's a GraphQL context
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.headers?.['x-lang'] || 'en';
  },
);
