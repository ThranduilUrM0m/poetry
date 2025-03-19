import { Document, Types } from 'mongoose';
export type UserDocument = User & Document & {
    _id: Types.ObjectId;
};
interface Country {
    _code: string;
    _country: string;
}
export declare class User {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    country?: Country;
    phone?: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export {};
