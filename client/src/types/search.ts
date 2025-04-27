import { JSX } from 'react';
import { Article, Comment } from '@/types/article';

export type SuggestionSourceType = 'Article' | 'Comment';
export type SuggestionType = 'author' | 'title' | 'category' | 'tag' | 'status' | 'visibility' | 'featured';

export interface BaseSuggestion {
    _id: string;
    title: string;
    type: SuggestionType;
    priority?: number;
    icon?: JSX.Element;
    sourceType?: SuggestionSourceType;
}

export interface ArticleSuggestion extends BaseSuggestion {
    sourceType?: 'Article';
    source?: Article;
}

export interface CommentSuggestion extends BaseSuggestion {
    sourceType?: 'Comment';
    source?: Comment;
}

export type SearchSuggestion = ArticleSuggestion | CommentSuggestion;