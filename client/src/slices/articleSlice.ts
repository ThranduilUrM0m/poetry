import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Article } from '@/types/article';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Base URL for the backend

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

export const fetchUpdatedArticle = createAsyncThunk(
    'article/fetchUpdatedArticle',
    async (articleId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get<Article>(`${API_BASE_URL}/api/articles/${articleId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// Vote on an article
export const voteArticle = createAsyncThunk(
    'articles/vote',
    async (
        {
            articleId,
            direction,
            fingerprint,
        }: { articleId: string; direction: 'up' | 'down'; fingerprint: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/articles/${articleId}/vote`, {
                direction,
                fingerprint,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// Track article view
export const trackView = createAsyncThunk(
    'articles/view',
    async (
        { articleId, fingerprint }: { articleId: string; fingerprint: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/articles/${articleId}/views`, {
                fingerprint,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const updateArticleById = createAsyncThunk(
    'articles/updateArticleById',
    async ({ id, data }: { id: string; data: Partial<Article> }, { rejectWithValue }) => {
        try {
            // Add ID validation
            if (!id || typeof id !== 'string') {
                throw new Error('Invalid comment ID');
            }
            
            console.log('Pute Chienne : ', id);
            const response = await axios.patch(`${API_BASE_URL}/api/articles/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const deleteArticle = createAsyncThunk(
    'articles/deleteArticle',
    async (id: string, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/articles/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const createArticle = createAsyncThunk(
    'articles/createArticle',
    async (data: Partial<Article>, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/articles`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue((error as Error).message);
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
            state.articles.push(action.payload);
        },
        updateArticleById(state, action: PayloadAction<Article>) {
            const index = state.articles.findIndex((article) => article._id === action.payload._id);
            if (index !== -1) {
                state.articles[index] = action.payload;
            }
        },
        deleteArticle(state, action: PayloadAction<string>) {
            state.articles = state.articles.filter((article) => article._id !== action.payload);
        },
        setCurrentArticle(state, action: PayloadAction<Article>) {
            if (action.payload._id) {
                state.currentArticle = action.payload;
                state.cachedArticles[action.payload._id] = action.payload;
            }
        },
        clearCurrentArticle(state) {
            state.currentArticle = null;
        },
        setCachedArticle(state, action: PayloadAction<Article>) {
            if (action.payload._id) {
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
            })
            .addCase(voteArticle.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUpdatedArticle.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUpdatedArticle.fulfilled, (state, action) => {
                if (state.currentArticle?._id === action.payload._id) {
                    state.currentArticle = action.payload; // Update the current article with new data
                }
                state.isLoading = false;
            })
            .addCase(fetchUpdatedArticle.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(voteArticle.fulfilled, (state, action) => {
                const updatedArticle = action.payload;
                const index = state.articles.findIndex((a) => a._id === updatedArticle._id);
                if (index !== -1) {
                    state.articles[index] = updatedArticle;
                }
                if (state.currentArticle?._id === updatedArticle._id) {
                    state.currentArticle = updatedArticle;
                }
                state.isLoading = false;
            })
            .addCase(voteArticle.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(updateArticleById.fulfilled, (state, action) => {
                const index = state.articles.findIndex(
                    (article) => article._id === action.payload._id
                );
                if (index !== -1) {
                    state.articles[index] = action.payload;
                }
                if (state.currentArticle?._id === action.payload._id) {
                    state.currentArticle = action.payload;
                }
            })
            // Delete Article
            .addCase(deleteArticle.fulfilled, (state, action) => {
                state.articles = state.articles.filter((article) => article._id !== action.payload);
                if (state.currentArticle?._id === action.payload) {
                    state.currentArticle = null;
                }
            })
            // Create Article
            .addCase(createArticle.fulfilled, (state, action) => {
                state.articles.push(action.payload);
            });
    },
});

// Export actions and reducer
export const {
    setArticles,
    addArticle,
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
export const selectCachedArticle = (id: string) => (state: RootState) =>
    state.article.cachedArticles[id];
export const selectIsLoading = (state: RootState) => state.article.isLoading;
export const selectError = (state: RootState) => state.article.error;
