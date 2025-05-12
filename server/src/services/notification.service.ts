import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, Types, isObjectIdOrHexString } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationDocument } from '../models/notification.model';
import { NotificationGateway } from '../gateways/notification.gateway';

export interface NotificationDto {
    category: string;
    action: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
    link?: string;
}

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name)
        private readonly notifModel: Model<NotificationDocument>,
        private readonly gateway: NotificationGateway
    ) {}

    // ─── Private Helpers ────────────────────────────────────

    /**
     * Validate that `id` is a proper ObjectId and fetches the document.
     * Throws BadRequestException on invalid format, NotFoundException if missing.
     */
    private async getByIdOrThrow(id: string): Promise<NotificationDocument> {
        if (!isObjectIdOrHexString(id)) {
            throw new BadRequestException(`Invalid notification ID "${id}"`);
        }
        const notif = await this.notifModel.findById(id).lean().exec();
        if (!notif) {
            throw new NotFoundException(`Notification "${id}" not found`);
        }
        return notif as NotificationDocument;
    }

    // ─── Public API ─────────────────────────────────────────

    /**
     * Create + persist a new notification, then broadcast via WebSocket.
     */
    async create(dto: NotificationDto): Promise<Notification | null> {
        const notif = await this.notifModel.create({
            ...dto,
            metadata: dto.metadata || {},
        });

        this.gateway.sendNotification(notif);
        return notif;
    }

    /**
     * Paginated listing for a single user.
     */
    async findAll(
        page = 1,
        limit = 20
    ): Promise<{
        items: Notification[];
        total: number;
        page: number;
        limit: number;
    }> {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.notifModel.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
            this.notifModel.countDocuments({}),
        ]);
        return { items, total, page, limit };
    }

    /**
     * Mark one notification as read.
     */
    async markAsRead(id: string): Promise<Notification> {
        await this.getByIdOrThrow(id);
        const updated = await this.notifModel
            .findByIdAndUpdate(id, { isRead: true }, { new: true, runValidators: true, lean: true })
            .exec();
        if (!updated) {
            throw new NotFoundException(`Notification "${id}" not found after marking as read`);
        }
        return updated;
    }

    /**
     * Mark all unread notifications for a user as read.
     */
    async markAllRead(): Promise<void> {
        await this.notifModel.updateMany({ isRead: false }, { isRead: true }).exec();
    }

    /**
     * Delete a notification by ID.
     */
    async delete(id: string): Promise<void> {
        await this.getByIdOrThrow(id);
        await this.notifModel.findByIdAndDelete(id).exec();
    }
}
