import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { UserEntity } from "./entities/user.entity";
import * as bcrypt from 'bcryptjs';
import { Role } from "@prisma/client";
//import { Role } from "../generated/prisma/enums";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async FindById(id: string): Promise<UserEntity> {
    const user =  await this.prisma.user.findUnique({ where: { id } });
    console.log(`User fetched: ${JSON.stringify(user)}`);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return new UserEntity(user);
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return new UserEntity(user);
  
  }

  async createUser(email: string, password: string, role: Role): Promise<UserEntity> {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException(`User with email ${email} already exists`);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role
      }
    });
    return new UserEntity(user);
  }

  async deactivateUser(id: string): Promise<UserEntity> {
    const user = await this.FindById(id);
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { active: false },
    });
    return new UserEntity(updatedUser);
  }
}