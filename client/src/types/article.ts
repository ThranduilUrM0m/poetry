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

export interface Upvote {
    _id: string; // Converted from Types.ObjectId
    _downvoter: string;
    createdAt: string;
    updatedAt: string;
}

export interface Downvote {
    _id: string; // Converted from Types.ObjectId
    _upvoter: string;
    createdAt: string;
    updatedAt: string;
}

export interface View {
    _id: string; // Converted from Types.ObjectId
    _viewer: string;
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    _id: string; // Converted from Types.ObjectId
    Parent?: string | null;
    _comment_isOK: boolean;
    _comment_author: string;
    _comment_email: string;
    _comment_body: string;
    _comment_isPrivate: boolean;
    _comment_fingerprint: string;
    _comment_upvotes: Upvote[];
    _comment_downvotes: Downvote[];
    _article: Article; // Add _article field to Comment
    createdAt: string;
    updatedAt: string;
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
    comments: Comment[]; // Updated to use Comment type
    views: View[];
    upvotes: Upvote[];
    downvotes: Downvote[];
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string; // Using string for JSON serialization compatibility
    updatedAt: string;
}
