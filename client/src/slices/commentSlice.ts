import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Comment } from '@/types/article';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Base URL for the backend

interface CommentState {
    comments: Comment[];
    currentComment: Comment | null;
    cachedComments: Record<string, Comment>;
    isLoading: boolean;
    error: string | null;
}

const initialState: CommentState = {
    comments: [],
    currentComment: null,
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

export const fetchComments = createAsyncThunk(
    'comment/fetchComments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get<Comment[]>(`${API_BASE_URL}/api/comments`);
            return response.data;
        } catch (error: unknown) {
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
        addComment(state, action: PayloadAction<Comment>) {
            state.comments = [...state.comments, action.payload];
        },
        updateComment(state, action: PayloadAction<Comment>) {
            state.comments = state.comments.map((comment) =>
                comment._id === action.payload._id ? action.payload : comment
            );
        },
        deleteComment(state, action: PayloadAction<string>) {
            state.comments = state.comments.filter((comment) => comment._id !== action.payload);
        },
        setCurrentComment(state, action: PayloadAction<Comment>) {
            state.currentComment = action.payload;
            if (!state.cachedComments[action.payload._id]) {
                state.cachedComments[action.payload._id] = action.payload;
            }
        },
        clearCurrentComment(state) {
            state.currentComment = null;
        },
        setCachedComment(state, action: PayloadAction<Comment>) {
            if (!state.cachedComments[action.payload._id]) {
                state.cachedComments[action.payload._id] = action.payload;
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
            .addCase(fetchComments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.comments = action.payload;
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch comments';
            });
    },
});

// Export actions and reducer
export const {
    setComments,
    addComment,
    updateComment,
    deleteComment,
    setCurrentComment,
    clearCurrentComment,
    setCachedComment,
    setLoading,
    setError,
} = commentSlice.actions;

export default commentSlice.reducer;

// Selectors
export const selectComments = (state: RootState) => state.comment.comments;
export const selectCurrentComment = (state: RootState) => state.comment.currentComment;
export const selectCachedComment = (_id: string) => (state: RootState) =>
    state.comment.cachedComments[_id];
export const selectIsLoading = (state: RootState) => state.comment.isLoading;
export const selectError = (state: RootState) => state.comment.error;
