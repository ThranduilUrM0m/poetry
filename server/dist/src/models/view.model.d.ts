import { Document, Types } from 'mongoose';
export type ViewDocument = View & Document & {
    _id: Types.ObjectId;
};
export declare class View {
    _viewer: string;
    article: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const ViewSchema: import("mongoose").Schema<View, import("mongoose").Model<View, any, any, any, Document<unknown, any, View> & View & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, View, Document<unknown, {}, import("mongoose").FlatRecord<View>> & import("mongoose").FlatRecord<View> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
