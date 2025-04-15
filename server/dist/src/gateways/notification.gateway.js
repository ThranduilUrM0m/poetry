"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let NotificationGateway = class NotificationGateway {
    constructor() {
        this.userSockets = new Map();
    }
    handleConnection(client) {
        const userId = client.handshake.query.userId;
        if (userId) {
            const userSockets = this.userSockets.get(userId) || [];
            userSockets.push(client.id);
            this.userSockets.set(userId, userSockets);
        }
    }
    handleDisconnect(client) {
        const userId = client.handshake.query.userId;
        if (userId) {
            const userSockets = this.userSockets.get(userId) || [];
            const updatedSockets = userSockets.filter((socketId) => socketId !== client.id);
            if (updatedSockets.length > 0) {
                this.userSockets.set(userId, updatedSockets);
            }
            else {
                this.userSockets.delete(userId);
            }
        }
    }
    sendNotification(userId, notification) {
        const userSockets = this.userSockets.get(userId.toString());
        if (userSockets) {
            userSockets.forEach((socketId) => {
                this.server.to(socketId).emit('notification', notification);
            });
        }
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
exports.NotificationGateway = NotificationGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
    })
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map