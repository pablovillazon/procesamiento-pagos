import { INestApplication, Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
//import { defineConfig, env } from "prisma/config";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    console.log(`Connecting to database at: ${process.env.DATABASE_URL}`);
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
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
    await this.$disconnect()
    }
}