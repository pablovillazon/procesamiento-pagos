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

  async create(data: { email: string, password: string, role: Role }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictException(`User with email ${data.email} already exists`);
    }
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role
      }
    });
    return new UserEntity(user);
  }

  async deactivate(id: string): Promise<void> {
    //const user = await this.FindById(id);
    await this.FindById(id) // Ensure user exists
    await this.prisma.user.update({
      where: { id },
      data: { active: false },
    })
  }
}