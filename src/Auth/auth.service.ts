/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../User/user.service';
import { User } from '../User/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmailForAuth(email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password as string);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if ((user as any).active === false) {
      throw new UnauthorizedException(
        'Usuário desativado. Para reativação, entre em contato com o administrativo do Ampara.',
      );
    }

    return user;
  }

  async login(user: User) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      profile: user.profile,
      name: user.name,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      accessToken: token,
      expiresIn: '24h',
    };
  }
}
