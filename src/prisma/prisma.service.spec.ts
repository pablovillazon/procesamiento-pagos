import { PrismaService } from "./prisma.service";

describe('PrismaService', () => {
    let prismaService: PrismaService;

    beforeAll(async () => {
        prismaService = new PrismaService();
        await prismaService.$connect();
    });

    afterAll(async () => {
        await prismaService.$disconnect();
    });

    it('should connect to database', async () => {
        const result = await prismaService.$queryRaw`SELECT 1`;
        expect(result).toBeDefined();
    });
})