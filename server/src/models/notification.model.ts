// notification.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
    @Prop({ required: true })
    category: string; // e.g. "comment", "article", "auth"

    @Prop({ required: true })
    action: string; // e.g. "created", "updated", "deleted", "logged_in"

    @Prop({ required: true })
    title: string; // short summary

    @Prop({ required: true })
    message: string; // human-readable detail

    @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
    metadata: Record<string, any>; // arbitrary key/values

    @Prop({ default: false })
    isRead: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
