import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationType } from '../models/notification.model';

@WebSocketGateway({
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
    },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private userSockets: Map<string, string[]> = new Map();

    handleConnection(client: Socket) {
        const userId = client.handshake.query.userId as string;
        if (userId) {
            const userSockets = this.userSockets.get(userId) || [];
            userSockets.push(client.id);
            this.userSockets.set(userId, userSockets);
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.handshake.query.userId as string;
        if (userId) {
            const userSockets = this.userSockets.get(userId) || [];
            const updatedSockets = userSockets.filter((socketId) => socketId !== client.id);
            if (updatedSockets.length > 0) {
                this.userSockets.set(userId, updatedSockets);
            } else {
                this.userSockets.delete(userId);
            }
        }
    }

    sendNotification(userId: string, notification: any) {
        const userSockets = this.userSockets.get(userId.toString());
        if (userSockets) {
            userSockets.forEach((socketId) => {
                this.server.to(socketId).emit('notification', notification);
            });
        }
    }
}
