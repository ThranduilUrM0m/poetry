import { JSX } from 'react';

export interface Author {
    username: string;
    firstname: string;
    lastname: string;
    city: string;
    country: string;
}

export interface ArticleSuggestion {
    id: string;
    title: string;
    body: string;
    author: Author;
    category: string;
    isPrivate: boolean;
    tags: string[];
    comments: string[];
    views: string[];
    upvotes: string[];
    downvotes: string[];
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
    slug: string;
}

export interface SearchSuggestion {
    id: string;
    title: string;
    type: 'title' | 'category' | 'author' | 'tag';
    source: ArticleSuggestion;
    similarity?: number;
    priority?: number;
    icon?: JSX.Element;
}
