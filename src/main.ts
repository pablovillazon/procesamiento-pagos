import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//import { PrismaClient } from '@prisma/client';
import { PrismaClient } from "./generated/prisma/client";
import 'dotenv/config';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
