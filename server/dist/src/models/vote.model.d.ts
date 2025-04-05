import { Document, Types } from 'mongoose';
export type VoteDocument = Vote & Document & {
    _id: Types.ObjectId;
};
export declare class Vote {
    voter: string;
    targetType: string;
    target: Types.ObjectId;
    direction: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const VoteSchema: import("mongoose").Schema<Vote, import("mongoose").Model<Vote, any, any, any, Document<unknown, any, Vote> & Vote & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Vote, Document<unknown, {}, import("mongoose").FlatRecord<Vote>> & import("mongoose").FlatRecord<Vote> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
