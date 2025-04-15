import { Document, Types } from 'mongoose';
export type NotificationDocument = Notification & Document;
export declare enum NotificationType {
    ARTICLE_CREATED = "ARTICLE_CREATED",
    ARTICLE_UPDATED = "ARTICLE_UPDATED",
    ARTICLE_DELETED = "ARTICLE_DELETED",
    COMMENT_CREATED = "COMMENT_CREATED",
    COMMENT_UPDATED = "COMMENT_UPDATED",
    COMMENT_DELETED = "COMMENT_DELETED",
    VOTE_ADDED = "VOTE_ADDED",
    VOTE_REMOVED = "VOTE_REMOVED",
    VIEW_ADDED = "VIEW_ADDED",
    SUBSCRIBER_ADDED = "SUBSCRIBER_ADDED",
    USER_REGISTERED = "USER_REGISTERED"
}
export declare class Notification {
    userId: Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    link: string;
    metadata: Record<string, any>;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const NotificationSchema: import("mongoose").Schema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification> & Notification & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>> & import("mongoose").FlatRecord<Notification> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
