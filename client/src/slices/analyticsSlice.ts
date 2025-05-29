// slices/analyticsSlice.ts

/**
 * analyticsSlice.ts
 * -----------------
 * This Redux slice computes comprehensive analytics data by combining aggregated metrics
 * from your existing slices (articles, comments, votes, views, subscribers) with additional
 * Google Analytics–like data (provided as dummy metrics). This approach assumes that your other
 * slices already retrieve data from your backend services (with database fallback handling).
 *
 * The computed metrics include:
 *   - Page views grouped by date (derived from the views slice)
 *   - Subscriber counts grouped by date (derived from the subscriber slice)
 *   - Article statistics (articles per category)
 *   - Per-article vote and comment counts
 *
 * And then these are merged with additional dummy metrics (audience demographics, device insights,
 * engagement, acquisition, user behavior, real-time analytics, enhanced metrics, and conversion tracking).
 *
 * We now support:
 *   • loadDummyAnalytics(): immediate dummy injection for UI
 *   • fetchAnalyticsLive(): real GA4-powered metrics fetched via your NestJS API
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { RootState } from '@/store';
import { AnalyticsData, dummyGAMetrics } from '@/utils/dummyGAMetrics';

interface AnalyticsState {
    data: AnalyticsData;
    isLoading: boolean;
    error: string | null;
}

// Start with dummy so your dashboard charts render even if live fetch lags/fails
const initialState: AnalyticsState = {
    data: dummyGAMetrics,
    isLoading: false,
    error: null,
};

/**
 * fetchAnalyticsLive
 * ------------------
 * Calls your NestJS endpoint (GET /api/analytics/live), which should in turn
 * invoke the GA4 Data or Realtime API, returning the same AnalyticsData shape.
 */
export const fetchAnalyticsLive = createAsyncThunk<AnalyticsData, void, { rejectValue: string }>(
    'analytics/fetchLive',
    async (_arg, { rejectWithValue }) => {
        try {
            const response = await axios.get<AnalyticsData>(
                `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/live`
            );
            return response.data;
        } catch (err) {
            let message = 'Failed to fetch live analytics';
            if (axios.isAxiosError(err)) {
                const axiosErr = err as AxiosError<{ message?: string }>;
                message = axiosErr.response?.data?.message ?? err.message;
            } else if (err instanceof Error) {
                message = err.message;
            }
            return rejectWithValue(message);
        }
    }
);

/**
 * loadDummyAnalytics
 * ------------------
 * Immediately (re)injects your dummyGAMetrics so the UI never “stalls” waiting for GA.
 */
export const loadDummyAnalytics = createAsyncThunk(
    'analytics/loadDummy',
    async (): Promise<AnalyticsData> => {
        return dummyGAMetrics;
    }
);

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        /** Clears any stored error without touching the data */
        clearAnalyticsError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // ▶️ loadDummyAnalytics lifecycle
        builder.addCase(loadDummyAnalytics.fulfilled, (state, action) => {
            state.data = action.payload;
            state.error = null;
        });

        // ▶️ fetchAnalyticsLive lifecycle
        builder
            .addCase(fetchAnalyticsLive.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(
                fetchAnalyticsLive.fulfilled,
                (state, action: PayloadAction<AnalyticsData>) => {
                    state.data = action.payload;
                    state.isLoading = false;
                }
            )
            .addCase(fetchAnalyticsLive.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload ?? action.error.message ?? null;
                // We KEEP the dummy (or last-known) data in state.data
            });
    },
});

export const { clearAnalyticsError } = analyticsSlice.actions;

export const selectAnalytics = (state: RootState) => state.analytics.data;
export const selectAnalyticsLoading = (state: RootState) => state.analytics.isLoading;
export const selectAnalyticsError = (state: RootState) => state.analytics.error;

export default analyticsSlice.reducer;
