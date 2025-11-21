/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must have at least 6 characters' })
  password: string;
}
