import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('health')
export class HealthController {
    constructor(private readonly healthService: HealthService, private readonly prisma: PrismaService) {}

    @Get()
    getHealth(): string {
        return this.healthService.getHealthStatus();
    }

    @Get('health/db')
    async checkDb() {
        await this.prisma.$queryRaw`SELECT 1`
        return { status: 'ok' }
    }
}