import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Downvote } from '@/types/article';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Base URL for the backend

interface DownvoteState {
    downvotes: Downvote[];
    isLoading: boolean;
    error: string | null;
}

const initialState: DownvoteState = {
    downvotes: [],
    isLoading: false,
    error: null,
};

export const fetchDownvotes = createAsyncThunk('downvotes/fetchDownvotes', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/downvotes`);
    return response.data;
});

const downvoteSlice = createSlice({
    name: 'downvotes',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDownvotes.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDownvotes.fulfilled, (state, action) => {
                state.isLoading = false;
                state.downvotes = action.payload;
            })
            .addCase(fetchDownvotes.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch downvotes';
            });
    },
});

export const selectDownvotes = (state: RootState) => state.downvotes.downvotes;
export const selectIsLoading = (state: RootState) => state.downvotes.isLoading;
export const selectError = (state: RootState) => state.downvotes.error;

export default downvoteSlice.reducer;
