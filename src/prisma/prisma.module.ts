/**
 * Prisma Database Module
 * 
 * Provides database access through Prisma ORM to other modules in the application.
 * This module encapsulates the Prisma service and makes it available as a singleton
 * provider throughout the NestJS application.
 * 
 * @module PrismaModule
 * @example
 * // Import in your application module
 * import { PrismaModule } from './prisma/prisma.module';
 * 
 * @Module({
 *   imports: [PrismaModule],
 * })
 * export class AppModule {}
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
//export default PrismaModule;
