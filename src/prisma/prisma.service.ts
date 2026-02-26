import { Injectable, OnModuleInit, OnModuleDestroy, INestApplication } from "@nestjs/common";
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "../generated/prisma/client";
import 'dotenv/config';

@Injectable()
export class PrismaService 
  extends PrismaClient 
  implements OnModuleInit, OnModuleDestroy 
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    super({ adapter });
  }  
  
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Prisma connected');
    } catch (error) {
      console.error('❌ Prisma connection error:', error);
      throw error;
    }
  } 

  // TODO: enableShutdownHooks if needed
  /*
  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    })
  }
  */

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Prisma disconnected');
  }
}