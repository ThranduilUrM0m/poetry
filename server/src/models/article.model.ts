import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Define the ArticleDocument type
export type ArticleDocument = Article & Document;

@Schema({ timestamps: true })
export class Article {
    @Prop({ required: true, unique: true })
    title: string;

    @Prop({ required: true })
    body: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    author: Types.ObjectId;

    @Prop({ required: true })
    category: string;

    @Prop({ default: false })
    isPrivate: boolean;

    @Prop([String])
    tags: string[];

    @Prop([{ type: Types.ObjectId, ref: 'Comment' }])
    comments: Types.ObjectId[];

    @Prop([{ type: Types.ObjectId, ref: 'View' }])
    views: Types.ObjectId[];

    @Prop([{ type: Types.ObjectId, ref: 'Upvote' }])
    upvotes: Types.ObjectId[];

    @Prop([{ type: Types.ObjectId, ref: 'Downvote' }])
    downvotes: Types.ObjectId[];

    @Prop({ enum: ['pending', 'approved', 'rejected'], default: 'pending' })
    status: string;
}

// Create the ArticleSchema
export const ArticleSchema = SchemaFactory.createForClass(Article);
