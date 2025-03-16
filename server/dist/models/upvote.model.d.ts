import { Document } from 'mongoose';
export type UpvoteDocument = Upvote & Document;
export declare class Upvote {
    _upvoter: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const UpvoteSchema: import("mongoose").Schema<Upvote, import("mongoose").Model<Upvote, any, any, any, Document<unknown, any, Upvote> & Upvote & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Upvote, Document<unknown, {}, import("mongoose").FlatRecord<Upvote>> & import("mongoose").FlatRecord<Upvote> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
