// src/modules/auth/auth.controller.ts
import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/auth')
export class AuthController {
    constructor(private auth: AuthService) {}

    // /api/auth/login
    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        return this.auth.login(req.user);
    }
}
