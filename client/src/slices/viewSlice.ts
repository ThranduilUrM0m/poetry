import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { View } from '@/types/article';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Base URL for the backend

interface ViewState {
    views: View[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ViewState = {
    views: [],
    isLoading: false,
    error: null,
};

export const fetchViews = createAsyncThunk('views/fetchViews', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/views`);
    return response.data;
});

const viewSlice = createSlice({
    name: 'views',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchViews.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchViews.fulfilled, (state, action) => {
                state.isLoading = false;
                state.views = action.payload;
            })
            .addCase(fetchViews.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch views';
            });
    },
});

export const selectViews = (state: RootState) => state.views.views;
export const selectIsLoading = (state: RootState) => state.views.isLoading;
export const selectError = (state: RootState) => state.views.error;

export default viewSlice.reducer;
