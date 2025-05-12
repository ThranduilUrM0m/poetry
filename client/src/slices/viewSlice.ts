import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { View } from '@/types/article';
import axios from 'axios';

interface ViewState {
    views: View[];
    currentView: View | null;
    cachedViews: Record<string, View>;
    isLoading: boolean;
    error: string | null;
}

const initialState: ViewState = {
    views: [],
    currentView: null,
    cachedViews: {},
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

export const fetchViews = createAsyncThunk('views/fetchViews', async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/views`);
    return response.data;
});

export const fetchUpdatedView = createAsyncThunk(
    'view/fetchUpdatedView',
    async (viewId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get<View>(`${process.env.NEXT_PUBLIC_API_URL}/api/views/${viewId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const viewSlice = createSlice({
    name: 'view',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchUpdatedView.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchUpdatedView.fulfilled, (state, action) => {
            if (state.currentView?._id === action.payload._id) {
                state.currentView = action.payload;
            }
            state.isLoading = false;
        })
        .addCase(fetchUpdatedView.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        })
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

export const selectViews = (state: RootState) => state.view.views;
export const selectIsLoading = (state: RootState) => state.view.isLoading;
export const selectError = (state: RootState) => state.view.error;

export default viewSlice.reducer;
