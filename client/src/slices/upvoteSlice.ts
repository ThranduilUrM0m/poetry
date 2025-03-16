import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Upvote } from '@/types/article';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Base URL for the backend

interface UpvoteState {
    upvotes: Upvote[];
    isLoading: boolean;
    error: string | null;
}

const initialState: UpvoteState = {
    upvotes: [],
    isLoading: false,
    error: null,
};

export const fetchUpvotes = createAsyncThunk('upvotes/fetchUpvotes', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/upvotes`);
    return response.data;
});

const upvoteSlice = createSlice({
    name: 'upvotes',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUpvotes.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUpvotes.fulfilled, (state, action) => {
                state.isLoading = false;
                state.upvotes = action.payload;
            })
            .addCase(fetchUpvotes.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch upvotes';
            });
    },
});

export const selectUpvotes = (state: RootState) => state.upvotes.upvotes;
export const selectIsLoading = (state: RootState) => state.upvotes.isLoading;
export const selectError = (state: RootState) => state.upvotes.error;

export default upvoteSlice.reducer;
