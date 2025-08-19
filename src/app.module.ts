import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config';
import jwtConfig from './config/jwt';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { EmailModule } from './common/email/email.module';
import { RoleModule } from './modules/role/role.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
// import { ProductModule } from './modules/product/product.module';
import { PermissionModule } from './modules/permission/permission.module';
import { FileModule } from './modules/file/file.module';
import { LocalizationModule } from './i18n/i18n.module';
import { GraphQLError } from 'graphql';
import { SpecializationModule } from './modules/specialization/specialization.module';
import { ZoneModule } from './modules/zone/zone.module';
import { DoctorRequest } from './modules/doctor-request/schemas/doctor-request.schema';
import { DoctorRequestModule } from './modules/doctor-request/doctor-request.module';

@Module({
  imports: [
    // ThrottlerModule.forRoot({
    //   throttlers: [
    //     {
    //       ttl: 60, // time-to-live: 60 seconds
    //       limit: 10, // max 10 requests per ttl If the user exceeds the limit, a 429 Too Many Requests error is thrown
    //     },
    //   ],
    // }),
    ConfigModule.forRoot({
      cache: true, // makes configuration available throughout the app without re-importing it.
      isGlobal: true,
      load: [configuration, jwtConfig],
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('database_url'),
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      autoSchemaFile: './src/schema.gql',
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      context: ({ req, res, connection }) => {
        // For HTTP requests:
        if (req) return { req, res };
        // For subscriptions (WebSocket):
        if (connection) return { user: connection.context.user };
      },

      subscriptions: {
        'graphql-ws': {
          onConnect: async (context) => {
            const { connectionParams } = context;
            console.log({ onConnect: 'Done' });
            const token =
              connectionParams.Authorization || connectionParams.authorization;

            if (!token) throw new Error('Missing auth token!');

            // try {
            //   const cleanToken = token.replace('Bearer ', '');
            //   const user = await jwtService.verifyAsync(cleanToken);
            //   if (!user) throw new Error('Unauthorized');

            //   return { user };
            // } catch {
            //   throw new Error('Unauthorized');
            // }
          },
        },
      },

      formatError: (error: GraphQLError) => {
        const { extensions, path } = error;
        const originalError: any = extensions?.originalError;

        // This will grab what you throw from exceptionFactory in ValidationPipe
        const validationMessages =
          originalError?.response?.message || originalError?.message;

        return {
          message:
            typeof validationMessages === 'string'
              ? validationMessages
              : 'Validation failed',
          errors:
            Array.isArray(validationMessages) && validationMessages.length > 0
              ? validationMessages
              : undefined,
          path,
          extensions: {
            code: extensions?.code,
            category: extensions?.category,
            status: extensions?.status,
          },
        };
      },
    }),
    AuthModule,
    UserModule,
    EmailModule,
    RoleModule,
    PermissionModule,
    // FileModule,
    LocalizationModule,
    SpecializationModule,
    ZoneModule,
    DoctorRequestModule,
  ],
  controllers: [],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}

// @Throttle(3, 10) // 3 requests per 10 seconds
//   @SkipThrottle()
