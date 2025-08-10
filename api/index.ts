import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { graphqlUploadExpress } from 'graphql-upload';

const server = express();

let cachedServer: express.Express;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.enableCors({
      origin: 'http://localhost:5173', // change this to your frontend URL or '*'
      credentials: true,
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
          const formattedErrors = errors.map((err) => ({
            field: err.property,
            constraints: err.constraints,
          }));
          return new BadRequestException(formattedErrors);
        },
      }),
    );
    app.use(cookieParser());
    app.use(
      '/graphql',
      graphqlUploadExpress({
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
      }),
    );

    // If you want to seed data on every cold start (optional)
    // const permissionSeedService = app.get(PermissionSeedService);
    // await permissionSeedService.seedDefaultPermissions();
    // ...

    await app.init();
    cachedServer = server;
  }
  return cachedServer;
}

export default async function handler(req, res) {
  const server = await bootstrap();
  server(req, res);
}
