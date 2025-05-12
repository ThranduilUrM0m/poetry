export type NotificationPayload = {
    category: string;
    title: string;
    message: string;
    action: string;
    metadata: Record<string, string | number | boolean>;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
};
