import { IsEmail, IsString, MinLength } from 'class-validator';

// TODO: remove ! from the fields after implementing validation pipe globally
export class LoginDto {
  @IsEmail()  
  email !: string;

  @IsString()
  @MinLength(6)
  password !: string;
}
