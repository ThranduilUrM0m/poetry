import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Comment } from '@/types/article';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Base URL for the backend

interface CommentState {
    comments: Comment[];
    currentComment: Comment | null;
    successMessage?: string | null;
    cachedComments: Record<string, Comment>;
    isLoading: boolean;
    error: string | null;
}

const initialState: CommentState = {
    comments: [],
    currentComment: null,
    successMessage: null,
    cachedComments: {},
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

// Add to commentSlice.ts
export const createComment = createAsyncThunk(
    'comments/create',
    async (commentData: Partial<Comment>, { rejectWithValue }) => {
        try {
            // Convert Article object to ID string for backend
            const backendPayload = {
                ...commentData,
                article: commentData.article?._id,
            };

            const response = await axios.post(`${API_BASE_URL}/api/comments`, backendPayload);
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const updateComment = createAsyncThunk(
    'comments/update',
    async ({ id, data }: { id: string; data: Partial<Comment> }, { rejectWithValue }) => {
        try {
            // Add ID validation
            if (!id || typeof id !== 'string') {
                throw new Error('Invalid comment ID');
            }

            const response = await axios.put(`${API_BASE_URL}/api/comments/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const voteComment = createAsyncThunk(
    'comments/vote',
    async (
        {
            commentId,
            direction,
            fingerprint,
        }: { commentId: string; direction: 'up' | 'down'; fingerprint: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/comments/${commentId}/vote`, {
                direction,
                fingerprint,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const fetchComments = createAsyncThunk(
    'comment/fetchComments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get<Comment[]>(`${API_BASE_URL}/api/comments`);
            if (!response.data) {
                throw new Error('No data received from server');
            }
            return response.data;
        } catch (error: unknown) {
            console.error('Error fetching comments:', error);
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message || 'Failed to fetch comments'
                );
            }
            return rejectWithValue('An error occurred while fetching comments');
        }
    }
);

export const fetchCommentsByArticle = createAsyncThunk(
    'comment/fetchCommentsByArticle',
    async (articleId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get<Comment[]>(
                `${API_BASE_URL}/api/comments/article/${articleId}`
            );
            // If response is successful but empty, return empty array
            return response.data || [];
        } catch (error: unknown) {
            let message = 'An unknown error occurred';
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || message;
            } else if (error instanceof Error) {
                message = error.message;
            }
            return rejectWithValue(message);
        }
    }
);

export const fetchUpdatedComment = createAsyncThunk(
    'comment/fetchUpdatedArticle',
    async (commentId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get<Comment>(`${API_BASE_URL}/api/comments/${commentId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const deleteComment = createAsyncThunk(
    'comments/delete',
    async ({ id, fingerprint }: { id: string; fingerprint: string }, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/comments/${id}`, {
                data: { fingerprint }, // Send fingerprint in the request body
            });
            return { id, message: response.data.message };
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const commentSlice = createSlice({
    name: 'comment',
    initialState,
    reducers: {
        setComments(state, action: PayloadAction<Comment[]>) {
            state.comments = action.payload;
        },
        setCurrentComment(state, action: PayloadAction<Comment>) {
            if (action.payload._id) {
                state.currentComment = action.payload;
                if (!state.cachedComments[action.payload._id]) {
                    state.cachedComments[action.payload._id] = action.payload;
                }
            }
        },
        clearCurrentComment(state) {
            state.currentComment = null;
        },
        setCachedComment(state, action: PayloadAction<Comment>) {
            if (action.payload._id) {
                state.cachedComments[action.payload._id] = action.payload;
            }
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
        clearCommentState: (state) => {
            state.isLoading = false;
            state.error = null;
            state.currentComment = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchComments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.comments = action.payload || [];
                state.error = null;
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Failed to fetch comments';
                state.comments = []; // Reset comments on error
            })
            .addCase(fetchCommentsByArticle.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCommentsByArticle.fulfilled, (state, action) => {
                state.comments = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchCommentsByArticle.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch comments';
            })
            .addCase(fetchUpdatedComment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUpdatedComment.fulfilled, (state, action) => {
                if (state.currentComment?._id === action.payload._id) {
                    state.currentComment = action.payload;
                }
                state.isLoading = false;
            })
            .addCase(fetchUpdatedComment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(voteComment.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(voteComment.fulfilled, (state, action) => {
                const updatedComment = action.payload;
                state.comments = state.comments.map((comment) =>
                    comment._id === updatedComment._id ? updatedComment : comment
                );
            })
            .addCase(voteComment.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to vote on comment';
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                // Remove the deleted comment from the state
                state.comments = state.comments.filter((comment) => comment._id !== action.payload.id);
            })
            .addCase(deleteComment.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to delete comment';
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.successMessage = 'Comment posted successfully';
                if (action.payload._id) {
                    state.comments.push(action.payload);
                }
            })
            .addCase(updateComment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.successMessage = 'Comment updated successfully';
                state.currentComment = null;
                const index = state.comments.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.comments[index] = action.payload;
                }
            });
    },
});

// Export actions and reducer
export const {
    setComments,
    setCurrentComment,
    clearCurrentComment,
    setCachedComment,
    setLoading,
    setError,
    clearCommentState,
} = commentSlice.actions;

export default commentSlice.reducer;

// Selectors
export const selectComments = (state: RootState) => state.comment.comments;
export const selectCurrentComment = (state: RootState) => state.comment.currentComment;
export const selectCachedComment = (_id: string) => (state: RootState) =>
    state.comment.cachedComments[_id];
export const selectIsLoading = (state: RootState) => state.comment.isLoading;
export const selectError = (state: RootState) => state.comment.error;
