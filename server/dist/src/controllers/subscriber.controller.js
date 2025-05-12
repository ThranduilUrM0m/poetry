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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriberController = void 0;
const common_1 = require("@nestjs/common");
const subscriber_service_1 = require("../services/subscriber.service");
const notification_service_1 = require("../services/notification.service");
const notification_gateway_1 = require("../gateways/notification.gateway");
let SubscriberController = class SubscriberController {
    constructor(subscriberService, notificationService, notificationGateway) {
        this.subscriberService = subscriberService;
        this.notificationService = notificationService;
        this.notificationGateway = notificationGateway;
    }
    async subscribe(email) {
        if (!email || typeof email !== 'string') {
            throw new common_1.BadRequestException('Email is required');
        }
        const subscriber = await this.subscriberService.subscribe(email);
        await this.notificationService.create({
            category: 'subscriber',
            action: 'subscribe',
            title: 'New Subscriber',
            message: `A new subscriber joined: ${email}`,
            metadata: { email },
        });
        this.notificationGateway.server.emit('subscriber:changed', {
            type: 'subscribe',
            subscriber,
        });
        return { message: 'Subscription successful!' };
    }
    async unsubscribe(email) {
        if (!email || typeof email !== 'string') {
            throw new common_1.BadRequestException('Email is required');
        }
        await this.subscriberService.unsubscribe(email);
        await this.notificationService.create({
            category: 'subscriber',
            action: 'unsubscribe',
            title: 'Unsubscribed',
            message: `A subscriber left: ${email}`,
            metadata: { email },
        });
        this.notificationGateway.server.emit('subscriber:changed', {
            type: 'unsubscribe',
            email,
        });
        return { message: 'Unsubscription successful!' };
    }
    async getAll() {
        return this.subscriberService.getAllSubscribers();
    }
    async getOne(email) {
        const subscriber = await this.subscriberService.findByEmail(email);
        if (!subscriber) {
            throw new common_1.NotFoundException('Subscriber not found');
        }
        return subscriber;
    }
};
exports.SubscriberController = SubscriberController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriberController.prototype, "subscribe", null);
__decorate([
    (0, common_1.Post)('unsubscribe'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriberController.prototype, "unsubscribe", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriberController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':email'),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriberController.prototype, "getOne", null);
exports.SubscriberController = SubscriberController = __decorate([
    (0, common_1.Controller)('api/subscribers'),
    __metadata("design:paramtypes", [subscriber_service_1.SubscriberService,
        notification_service_1.NotificationService,
        notification_gateway_1.NotificationGateway])
], SubscriberController);
//# sourceMappingURL=subscriber.controller.js.map