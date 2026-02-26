import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
//import { User as UserModel } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly usersService: UsersService, private readonly prisma: PrismaService) {}
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health/db')
  async checkDb() {
    await this.prisma.$queryRaw`SELECT 1`
    return { status: 'ok' }
  }
}
