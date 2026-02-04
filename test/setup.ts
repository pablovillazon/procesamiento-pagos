import { PrismaClient } from '../src/generated/prisma';
const prisma = new PrismaClient()


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

