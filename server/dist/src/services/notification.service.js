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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const mongoose_2 = require("@nestjs/mongoose");
const notification_model_1 = require("../models/notification.model");
const notification_gateway_1 = require("../gateways/notification.gateway");
let NotificationService = class NotificationService {
    constructor(notifModel, gateway) {
        this.notifModel = notifModel;
        this.gateway = gateway;
    }
    async getByIdOrThrow(id) {
        if (!(0, mongoose_1.isObjectIdOrHexString)(id)) {
            throw new common_1.BadRequestException(`Invalid notification ID "${id}"`);
        }
        const notif = await this.notifModel.findById(id).lean().exec();
        if (!notif) {
            throw new common_1.NotFoundException(`Notification "${id}" not found`);
        }
        return notif;
    }
    async create(dto) {
        const notif = await this.notifModel.create({
            ...dto,
            metadata: dto.metadata || {},
        });
        this.gateway.sendNotification(notif);
        return notif;
    }
    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.notifModel.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
            this.notifModel.countDocuments({}),
        ]);
        return { items, total, page, limit };
    }
    async markAsRead(id) {
        await this.getByIdOrThrow(id);
        const updated = await this.notifModel
            .findByIdAndUpdate(id, { isRead: true }, { new: true, runValidators: true, lean: true })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Notification "${id}" not found after marking as read`);
        }
        return updated;
    }
    async markAllRead() {
        await this.notifModel.updateMany({ isRead: false }, { isRead: true }).exec();
    }
    async countUnread(userId) {
        const count = await this.notifModel.countDocuments({ user: userId, isRead: false });
        return { count };
    }
    async delete(id) {
        await this.getByIdOrThrow(id);
        await this.notifModel.findByIdAndDelete(id).exec();
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_2.InjectModel)(notification_model_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_1.Model,
        notification_gateway_1.NotificationGateway])
], NotificationService);
//# sourceMappingURL=notification.service.js.map