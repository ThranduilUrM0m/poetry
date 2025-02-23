/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: process.env.USERNAME_FIELD || 'username',
      passwordField: process.env.PASSWORD_FIELD || 'password',
    } as IStrategyOptions);
  }

  async validate(username: string, password: string): Promise<any> {
    if (!username || !password) {
      throw new UnauthorizedException('Username and password are required');
    }

    try {
      const user = await this.authService.validateUser(username, password);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }
}

interface IStrategyOptions {
  usernameField?: string;
  passwordField?: string;
}
