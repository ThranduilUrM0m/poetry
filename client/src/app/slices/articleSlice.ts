// src/slices/articleSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Define the Article interface
interface Article {
    id: string;
    title: string;
    body: string;
    author: string;
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
}

// Define the initial state
interface ArticleState {
    articles: Article[];
}

const initialState: ArticleState = {
    articles: [],
};

// Create the article slice
const articleSlice = createSlice({
    name: 'article',
    initialState,
    reducers: {
        setArticles(state, action: PayloadAction<Article[]>) {
            state.articles = action.payload;
        },
        addArticle(state, action: PayloadAction<Article>) {
            state.articles.push(action.payload);
        },
        updateArticle(state, action: PayloadAction<Article>) {
            const index = state.articles.findIndex((article) => article.id === action.payload.id);
            if (index !== -1) {
                state.articles[index] = action.payload;
            }
        },
        deleteArticle(state, action: PayloadAction<string>) {
            state.articles = state.articles.filter((article) => article.id !== action.payload);
        },
    },
});

// Export actions and reducer
export const { setArticles, addArticle, updateArticle, deleteArticle } = articleSlice.actions;
export default articleSlice.reducer;

// Selector
export const selectArticles = (state: RootState) => state.article.articles;
