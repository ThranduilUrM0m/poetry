// src/modules/auth/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        // Adjust to match your form field names:
        super({
            usernameField: 'login',
            passwordField: 'password',
        });
    }

    // Validate method receives 'login' (email or username) and password.
    async validate(login: string, password: string) {
        return this.authService.validateUser(login, password);
    }
}
