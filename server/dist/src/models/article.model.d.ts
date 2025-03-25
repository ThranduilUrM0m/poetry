import { Document, Types } from 'mongoose';
export type ArticleDocument = Article & Document & {
    _id: Types.ObjectId;
};
export declare class Article {
    title: string;
    body: string;
    author: Types.ObjectId;
    category: string;
    slug: string;
    isPrivate: boolean;
    isFeatured: boolean;
    tags: string[];
    comments: Types.ObjectId[];
    views: Types.ObjectId[];
    upvotes: Types.ObjectId[];
    downvotes: Types.ObjectId[];
    status: string;
    isBio: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const ArticleSchema: import("mongoose").Schema<Article, import("mongoose").Model<Article, any, any, any, Document<unknown, any, Article> & Article & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Article, Document<unknown, {}, import("mongoose").FlatRecord<Article>> & import("mongoose").FlatRecord<Article> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
