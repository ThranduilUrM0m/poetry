// src/auth/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * This guard invokes the "jwt" strategy (JwtStrategy) you already defined.
 * Use it on any controller or route that must be protected by a valid Bearer token.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
