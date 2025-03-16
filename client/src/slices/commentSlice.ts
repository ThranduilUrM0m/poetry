import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Comment } from '@/types/article';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Base URL for the backend

interface CommentState {
    comments: Comment[];
    isLoading: boolean;
    error: string | null;
}

const initialState: CommentState = {
    comments: [],
    isLoading: false,
    error: null,
};

export const fetchComments = createAsyncThunk('comments/fetchComments', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/comments`);
    return response.data;
});

const commentSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {},
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

export const selectComments = (state: RootState) => state.comments.comments;
export const selectIsLoading = (state: RootState) => state.comments.isLoading;
export const selectError = (state: RootState) => state.comments.error;

export default commentSlice.reducer;
