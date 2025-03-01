export interface Article {
    id: string;
    title: string;
    body: string;
    author: string;
    category: string;
    slug: string;
    isPrivate: boolean;
    tags: string[];
    comments: string[];
    views: string[];
    upvotes: string[];
    downvotes: string[];
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
}
