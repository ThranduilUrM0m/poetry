import { NotificationService } from '../services/notification.service';
export declare class NotificationController {
    private readonly service;
    constructor(service: NotificationService);
    list(page?: string, limit?: string): Promise<{
        items: import("../models/notification.model").Notification[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    markOne(id: string): Promise<import("../models/notification.model").Notification>;
    markAll(): Promise<{
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
