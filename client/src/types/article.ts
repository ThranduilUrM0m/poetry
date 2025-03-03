import { Types } from 'mongoose';

export interface Author {
    _id: Types.ObjectId;
    email: string;
    username: string;
    password: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    city?: string;
    firstName?: string;
    lastName?: string;
    country?: { _code: string; _country: string };
}

export interface Article {
    _id: Types.ObjectId;
    title: string;
    body: string;
    author: {
        username: string;
        firstname?: string;
        lastname?: string;
        city?: string;
        country?: { _code: string; _country: string };
    };
    category: string;
    isPrivate: boolean;
    tags: string[];
    comments: Types.ObjectId[];
    views: Types.ObjectId[];
    upvotes: Types.ObjectId[];
    downvotes: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    slug?: string;
}
