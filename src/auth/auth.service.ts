import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';
import { UserEntity } from "../users/entities/user.entity";
import { User } from "src/generated/prisma/client";

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwt: JwtService) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    console.log(`Validating user: ${email}`);

    if(!user || !bcrypt.compareSync(password, user.password)) return null;

    return user;
    }
async login(user: UserEntity) {
    const payload = { sub: user.id, role: user};
    return {
      access_token: this.jwt.sign(payload),
    }
  }
}