import { Model } from 'mongoose';
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
export declare class NotificationService {
    private readonly notifModel;
    private readonly gateway;
    constructor(notifModel: Model<NotificationDocument>, gateway: NotificationGateway);
    private getByIdOrThrow;
    create(dto: NotificationDto): Promise<Notification | null>;
    findAll(page?: number, limit?: number): Promise<{
        items: Notification[];
        total: number;
        page: number;
        limit: number;
    }>;
    markAsRead(id: string): Promise<Notification>;
    markAllRead(): Promise<void>;
    delete(id: string): Promise<void>;
}
