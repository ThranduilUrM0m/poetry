// ws-jwt.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const client: Socket = context.switchToWs().getClient<Socket>();
        const token = client.handshake.auth?.token;
        if (!token) throw new UnauthorizedException('No token provided');

        try {
            const payload = this.jwtService.verify(token);
            // attach the entire user payload to client.data.user
            client.data.user = payload;
            return true;
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
