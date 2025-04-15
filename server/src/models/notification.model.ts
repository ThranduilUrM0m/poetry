import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
    ARTICLE_CREATED = 'ARTICLE_CREATED',
    ARTICLE_UPDATED = 'ARTICLE_UPDATED',
    ARTICLE_DELETED = 'ARTICLE_DELETED',
    COMMENT_CREATED = 'COMMENT_CREATED',
    COMMENT_UPDATED = 'COMMENT_UPDATED',
    COMMENT_DELETED = 'COMMENT_DELETED',
    VOTE_ADDED = 'VOTE_ADDED',
    VOTE_REMOVED = 'VOTE_REMOVED',
    VIEW_ADDED = 'VIEW_ADDED',
    SUBSCRIBER_ADDED = 'SUBSCRIBER_ADDED',
    USER_REGISTERED = 'USER_REGISTERED',
}

@Schema({ timestamps: true })
export class Notification {
    @Prop({ required: true })
    userId: Types.ObjectId;

    @Prop({ required: true, enum: NotificationType })
    type: NotificationType;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    message: string;

    @Prop({ required: true })
    link: string;

    @Prop({ type: Object })
    metadata: Record<string, any>;

    @Prop({ default: false })
    isRead: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
