export interface Country {
    _code: string;
    _country: string;
}

export interface Author {
    _id?: string; // Converted from Types.ObjectId
    email: string;
    username: string;
    passwordHash?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    country?: Country;
    phone?: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Vote {
    _id?: string; // Converted from Types.ObjectId
    voter: string;
    targetType: 'Article' | 'Comment';
    target: Article | Comment;
    direction: 'up' | 'down';
    createdAt?: string;
    updatedAt?: string;
}

export interface View {
    _id?: string; // Converted from Types.ObjectId
    _viewer: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Comment {
    _id?: string; // Converted from Types.ObjectId
    Parent?: string | null;
    _comment_isOK?: boolean;
    _comment_author: string;
    _comment_email: string;
    _comment_body: string;
    _comment_isPrivate: boolean;
    _comment_fingerprint: string;
    _comment_votes?: Vote[];
    isFeatured?: boolean;
    article: Article | null; // Add _article field to Comment
    createdAt?: string;
    updatedAt?: string;
}

export interface Article {
    _id?: string; // Converted from Types.ObjectId
    title: string;
    body: string;
    author: Author;
    category: string;
    slug: string;
    isPrivate: boolean;
    isFeatured?: boolean;
    tags?: string[];
    comments?: Comment[]; // Updated to use Comment type
    views?: View[];
    votes?: Vote[];
    status: 'pending' | 'approved' | 'rejected';
    createdAt?: string; // Using string for JSON serialization compatibility
    updatedAt?: string;
}
