import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL as string,
      });
const prisma = new PrismaClient({ adapter });

beforeAll(async () => {
    await prisma.$connect()
})


afterEach(async () => {
    const tables = ['User']
    for (const table of tables) {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE \"${table}\" CASCADE;`)
    }
})


afterAll(async () => {
    await prisma.$disconnect()
})

