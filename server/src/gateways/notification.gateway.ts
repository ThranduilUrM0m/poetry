// src/gateways/notification.gateway.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@Injectable()
@WebSocketGateway({
    cors: { origin: '*' },
    allowEIO3: true, // ← support legacy polling handshakes
    transports: ['websocket', 'polling'],
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        
    }

    handleDisconnect(client: Socket) {
        
    }

    /**
     * Send a notification to all connected sockets of a given user.
     */
    sendNotification(notification: any) {
        this.server.emit('notification', notification);
    }
}
