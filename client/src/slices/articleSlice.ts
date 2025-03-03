// src/slices/articleSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { ArticleForRedux } from '@/types/article';

// Define the initial state
interface ArticleState {
    articles: ArticleForRedux[];
    currentArticle: ArticleForRedux | null;
    cachedArticles: { [key: string]: ArticleForRedux };
    isLoading: boolean;
    error: string | null;
}

const initialState: ArticleState = {
    articles: [],
    currentArticle: null,
    cachedArticles: {},
    isLoading: false,
    error: null,
};

// Create the article slice
const articleSlice = createSlice({
    name: 'article',
    initialState,
    reducers: {
        setArticles(state, action: PayloadAction<ArticleForRedux[]>) {
            state.articles = action.payload;
        },
        addArticle(state, action: PayloadAction<ArticleForRedux>) {
            state.articles.push(action.payload);
        },
        updateArticle(state, action: PayloadAction<ArticleForRedux>) {
            const index = state.articles.findIndex((article) => article._id === action.payload._id);
            if (index !== -1) {
                state.articles[index] = action.payload;
            }
        },
        deleteArticle(state, action: PayloadAction<string>) {
            state.articles = state.articles.filter((article) => article._id !== action.payload);
        },
        setCurrentArticle(state, action: PayloadAction<ArticleForRedux>) {
            state.currentArticle = action.payload;
            state.cachedArticles[action.payload._id] = action.payload;
        },
        clearCurrentArticle(state) {
            state.currentArticle = null;
        },
        setCachedArticle(state, action: PayloadAction<ArticleForRedux>) {
            state.cachedArticles[action.payload._id] = action.payload;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
    },
});

// Export actions and reducer
export const {
    setArticles,
    addArticle,
    updateArticle,
    deleteArticle,
    setCurrentArticle,
    clearCurrentArticle,
    setCachedArticle,
    setLoading,
    setError,
} = articleSlice.actions;
export default articleSlice.reducer;

// Selectors
export const selectArticles = (state: RootState) => state.article.articles;
export const selectCurrentArticle = (state: RootState) => state.article.currentArticle;
export const selectCachedArticle = (_id: string) => (state: RootState) =>
    state.article.cachedArticles[_id];
export const selectIsLoading = (state: RootState) => state.article.isLoading;
export const selectError = (state: RootState) => state.article.error;
