import { Types } from 'mongoose';
export declare function isObjectIdInstance(value: unknown): value is Types.ObjectId;
export declare function isObjectIdString(value: unknown): value is string;
export declare function isValidObjectId(value: unknown): value is Types.ObjectId | string;
