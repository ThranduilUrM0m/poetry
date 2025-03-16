import { Document } from 'mongoose';
export type DownvoteDocument = Downvote & Document;
export declare class Downvote {
    _downvoter: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const DownvoteSchema: import("mongoose").Schema<Downvote, import("mongoose").Model<Downvote, any, any, any, Document<unknown, any, Downvote> & Downvote & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Downvote, Document<unknown, {}, import("mongoose").FlatRecord<Downvote>> & import("mongoose").FlatRecord<Downvote> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
