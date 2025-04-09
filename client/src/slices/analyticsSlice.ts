import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export interface AnalyticsData {
    pageViews: { date: string; views: number }[];
    interactions: { name: string; value: number }[];
    subscribers: { date: string; count: number }[];
    articleStats: { category: string; count: number }[];
}

interface AnalyticsState {
    data: AnalyticsData;
    isLoading: boolean;
    error: string | null;
}

const initialState: AnalyticsState = {
    data: {
        pageViews: [],
        interactions: [],
        subscribers: [],
        articleStats: [],
    },
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

export const fetchAnalytics = createAsyncThunk(
    'analytics/fetch', 
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/analytics`);
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAnalytics.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAnalytics.fulfilled, (state, action: PayloadAction<AnalyticsData>) => {
                state.data = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchAnalytics.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string || 'Failed to fetch analytics';
            });
    },
});

export default analyticsSlice.reducer;
export const selectAnalytics = (state: RootState) => state.analytics.data;
export const selectAnalyticsLoading = (state: RootState) => state.analytics.isLoading;
export const selectAnalyticsError = (state: RootState) => state.analytics.error;
