import mongoose, { Document, Types } from 'mongoose';
export type NotificationDocument = Notification & Document;
export declare class Notification {
    category: string;
    action: string;
    title: string;
    message: string;
    metadata: Record<string, any>;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const NotificationSchema: mongoose.Schema<Notification, mongoose.Model<Notification, any, any, any, mongoose.Document<unknown, any, Notification> & Notification & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Notification, mongoose.Document<unknown, {}, mongoose.FlatRecord<Notification>> & mongoose.FlatRecord<Notification> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
