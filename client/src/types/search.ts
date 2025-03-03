import { JSX } from 'react';
import { Article } from '@/types/article';

export interface SearchSuggestion {
    _id: string;
    title: string;
    type: 'title' | 'category' | 'author' | 'tag';
    source: Article;
    similarity?: number;
    priority?: number;
    icon?: JSX.Element;
}
