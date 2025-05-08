import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import slugify from 'slugify';

export type ArticleDocument = Article & Document & { _id: Types.ObjectId };

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

    @Prop({ default: '' })
    slug: string;

    @Prop({ default: false })
    isPrivate: boolean;

    @Prop({ default: false })
    isFeatured: boolean;

    @Prop([String])
    tags: string[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }] })
    comments: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'View' }] })
    views: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Vote' }] })
    votes: Types.ObjectId[];

    @Prop({ enum: ['pending', 'approved', 'rejected'], default: 'pending' })
    status: string;

    @Prop({ default: false })
    isBio: boolean; // Add isBio field to Article

    createdAt?: Date;
    updatedAt?: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

ArticleSchema.pre('save', function (next) {
    const article = this as ArticleDocument;
    if (article.isModified('title')) {
        if (typeof article.title === 'string') {
            const generatedSlug: string = slugify(article.title, { lower: true, strict: true });
            article.slug = generatedSlug;
        }
    }
    next();
});
