import { Document, Types } from 'mongoose';
export type SubscriberDocument = Subscriber & Document & {
    _id: Types.ObjectId;
};
export declare class Subscriber {
    email: string;
    isSubscribed: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const SubscriberSchema: import("mongoose").Schema<Subscriber, import("mongoose").Model<Subscriber, any, any, any, Document<unknown, any, Subscriber> & Subscriber & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Subscriber, Document<unknown, {}, import("mongoose").FlatRecord<Subscriber>> & import("mongoose").FlatRecord<Subscriber> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
