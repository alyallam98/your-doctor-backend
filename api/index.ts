import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module'; // Adjust the path if needed
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { ExpressAdapter } from '@nestjs/platform-express';

let cachedServer;

async function bootstrap() {
  if (!cachedServer) {
    const server = express();

    // Use cookie-parser middleware here
    server.use(cookieParser());

    const adapter = new ExpressAdapter(server);
    const app = await NestFactory.create(AppModule, adapter);
    await app.init();

    cachedServer = server;
  }
  return cachedServer;
}

export default async function handler(req, res) {
  const server = await bootstrap();
  server(req, res);
}
