import { Document, Types } from 'mongoose';
export type CommentDocument = Comment & Document & {
    _id: Types.ObjectId;
};
export declare class Comment {
    Parent?: Types.ObjectId | null;
    _comment_isOK: boolean;
    isFeatured: boolean;
    _comment_author: string;
    _comment_email: string;
    _comment_body: string;
    _comment_isPrivate: boolean;
    _comment_fingerprint: string;
    article: Types.ObjectId;
    _comment_votes: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const CommentSchema: import("mongoose").Schema<Comment, import("mongoose").Model<Comment, any, any, any, Document<unknown, any, Comment> & Comment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Comment, Document<unknown, {}, import("mongoose").FlatRecord<Comment>> & import("mongoose").FlatRecord<Comment> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
