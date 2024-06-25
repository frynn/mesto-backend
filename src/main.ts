import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as cors from 'cors';

declare module 'express' {
  interface Request {
    user?: Prisma.UserGetPayload<Prisma.UserDefaultArgs>;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: { origin: true } });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);

  app.use(
    cors({
      origin: 'http://localhost:4200', // Замените на URL вашего фронтенда
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    }),
  );
}

bootstrap();
