import { Document } from 'mongoose';
export type ViewDocument = View & Document;
export declare class View {
    _viewer: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const ViewSchema: import("mongoose").Schema<View, import("mongoose").Model<View, any, any, any, Document<unknown, any, View> & View & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, View, Document<unknown, {}, import("mongoose").FlatRecord<View>> & import("mongoose").FlatRecord<View> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
