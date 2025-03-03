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

// Redux-specific interface with `_id` as string
export interface ArticleForRedux
    extends Omit<Article, '_id' | 'comments' | 'views' | 'upvotes' | 'downvotes'> {
    _id: string;
    comments: string[];
    views: string[];
    upvotes: string[];
    downvotes: string[];
}

/* When fetching data from backend, ensure that you convert _id and other Types.ObjectId fields to strings before storing them in Redux */
/* const response = await fetch('/api/articles');
const data = await response.json();

// Convert _id and other ObjectId fields to strings
const articlesForRedux: ArticleForRedux[] = data.map((article: Article) => ({
    ...article,
    _id: article._id.toString(),
    comments: article.comments.map((comment) => comment.toString()),
    views: article.views.map((view) => view.toString()),
    upvotes: article.upvotes.map((upvote) => upvote.toString()),
    downvotes: article.downvotes.map((downvote) => downvote.toString()),
}));

dispatch(setArticles(articlesForRedux)); */