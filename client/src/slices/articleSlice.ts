import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Article } from '@/types/article';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Base URL for the backend

// Define the initial state
interface ArticleState {
    articles: Article[];
    currentArticle: Article | null;
    cachedArticles: Record<string, Article>;
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

// Utility function to extract error message
const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || 'An error occurred while fetching data';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
};

// Fetch article by slug using Axios
export const fetchArticleBySlug = createAsyncThunk(
    'article/fetchArticleBySlug',
    async ({ category, slug }: { category: string; slug: string }, { rejectWithValue }) => {
        try {
            const response = await axios.get<Article>(
                `${API_BASE_URL}/api/articles/${category}/${slug}`
            );
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// Fetch all articles using Axios
export const fetchArticles = createAsyncThunk(
    'article/fetchArticles',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get<Article[]>(`${API_BASE_URL}/api/articles`);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// Create the article slice
const articleSlice = createSlice({
    name: 'article',
    initialState,
    reducers: {
        setArticles(state, action: PayloadAction<Article[]>) {
            state.articles = action.payload;
        },
        addArticle(state, action: PayloadAction<Article>) {
            state.articles = [...state.articles, action.payload];
        },
        updateArticle(state, action: PayloadAction<Article>) {
            state.articles = state.articles.map((article) =>
                article._id === action.payload._id ? action.payload : article
            );
        },
        deleteArticle(state, action: PayloadAction<string>) {
            state.articles = state.articles.filter((article) => article._id !== action.payload);
        },
        setCurrentArticle(state, action: PayloadAction<Article>) {
            state.currentArticle = action.payload;
            if (!state.cachedArticles[action.payload._id]) {
                state.cachedArticles[action.payload._id] = action.payload;
            }
        },
        clearCurrentArticle(state) {
            state.currentArticle = null;
        },
        setCachedArticle(state, action: PayloadAction<Article>) {
            if (!state.cachedArticles[action.payload._id]) {
                state.cachedArticles[action.payload._id] = action.payload;
            }
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchArticleBySlug.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchArticleBySlug.fulfilled, (state, action) => {
                state.currentArticle = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchArticleBySlug.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchArticles.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchArticles.fulfilled, (state, action) => {
                state.articles = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchArticles.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
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
