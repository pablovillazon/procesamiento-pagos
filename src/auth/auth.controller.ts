import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log(`Login attempt for email: ${loginDto.email}`);
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    console.log(`Validation result for email ${loginDto.email}: ${user ? 'User validated' : 'Invalid credentials'}`);
    if (!user) {
      return { error: 'Invalid credentials' };
    }
    return this.authService.login(user);
  }
}
