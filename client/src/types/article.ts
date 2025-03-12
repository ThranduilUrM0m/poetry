export interface Country {
    _code: string;
    _country: string;
}

export interface Author {
    _id: string; // Converted from Types.ObjectId
    email: string;
    username: string;
    isVerified: boolean;
    isActive: boolean;
    city?: string;
    firstName?: string;
    lastName?: string;
    country?: Country;
}

export interface Article {
    _id: string; // Converted from Types.ObjectId
    title: string;
    body: string;
    author: Author;
    category: string;
    slug: string;
    isPrivate: boolean;
    tags: string[];
    comments: string[]; // Converted from Types.ObjectId[]
    views: string[];
    upvotes: string[];
    downvotes: string[];
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string; // Using string for JSON serialization compatibility
    updatedAt: string;
}
