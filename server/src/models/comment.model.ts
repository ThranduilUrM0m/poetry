import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class Comment {
    @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
    Parent?: Types.ObjectId | null;

    @Prop({ required: true, default: false })
    _comment_isOK: boolean;

    @Prop({ default: false })
    isFeatured: boolean;

    @Prop({ required: true, trim: true })
    _comment_author: string;

    @Prop({ lowercase: true, trim: true })
    _comment_email: string;

    @Prop({ required: true })
    _comment_body: string;

    @Prop({ default: false })
    _comment_isPrivate: boolean;

    @Prop({ required: true })
    _comment_fingerprint: string;

    @Prop({ type: Types.ObjectId, ref: 'Article', required: true })
    article: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Vote' }] })
    _comment_votes: Types.ObjectId[];

    createdAt?: Date;
    updatedAt?: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
