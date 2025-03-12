import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Subscriber } from '@/types/subscriber';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Base URL for the backend

// Define the initial state
interface SubscriberState {
    subscribers: Subscriber[];
    currentSubscriber: Subscriber | null;
    cachedSubscribers: Record<string, Subscriber>;
    isLoading: boolean;
    error: string | null;
}

const initialState: SubscriberState = {
    subscribers: [],
    currentSubscriber: null,
    cachedSubscribers: {},
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

export const subscribeSubscriber = createAsyncThunk(
    'subscriber/subscribeSubscriber',
    async (email: string, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/subscribers`, { email });
            return response.data; // Return the newly added subscriber
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                // Handle specific API errors
                if (error.response?.status === 400) {
                    return rejectWithValue('Invalid email address.');
                } else if (error.response?.status === 409) {
                    return rejectWithValue('This email is already subscribed.');
                } else {
                    return rejectWithValue('An error occurred. Please try again later.');
                }
            }
            return rejectWithValue('An unknown error occurred.');
        }
    }
);

// Fetch subscriber by slug using Axios
export const fetchSubscriberBySlug = createAsyncThunk(
    'subscriber/fetchSubscriberBySlug',
    async ({ email }: { email: string }, { rejectWithValue }) => {
        try {
            const response = await axios.get<Subscriber>(
                `${API_BASE_URL}/api/subscribers/${email}`
            );
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// Fetch all subscribers using Axios
export const fetchAllSubscribers = createAsyncThunk(
    'subscriber/fetchAllSubscribers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get<Subscriber[]>(`${API_BASE_URL}/api/subscribers`);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// Fetch all subscribers using Axios
export const fetchSubscribers = createAsyncThunk(
    'subscriber/fetchSubscribers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get<Subscriber[]>(`${API_BASE_URL}/api/subscribers/_subscribers`);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// Create the subscriber slice
const subscriberSlice = createSlice({
    name: 'subscriber',
    initialState,
    reducers: {
        setSubscribers(state, action: PayloadAction<Subscriber[]>) {
            state.subscribers = action.payload;
        },
        addSubscriber(state, action: PayloadAction<Subscriber>) {
            state.subscribers = [...state.subscribers, action.payload];
        },
        updateSubscriber(state, action: PayloadAction<Subscriber>) {
            state.subscribers = state.subscribers.map((subscriber) =>
                subscriber._id === action.payload._id ? action.payload : subscriber
            );
        },
        deleteSubscriber(state, action: PayloadAction<string>) {
            state.subscribers = state.subscribers.filter((subscriber) => subscriber._id !== action.payload);
        },
        setCurrentSubscriber(state, action: PayloadAction<Subscriber>) {
            state.currentSubscriber = action.payload;
            if (!state.cachedSubscribers[action.payload._id]) {
                state.cachedSubscribers[action.payload._id] = action.payload;
            }
        },
        clearCurrentSubscriber(state) {
            state.currentSubscriber = null;
        },
        setCachedSubscriber(state, action: PayloadAction<Subscriber>) {
            if (!state.cachedSubscribers[action.payload._id]) {
                state.cachedSubscribers[action.payload._id] = action.payload;
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
            .addCase(fetchSubscriberBySlug.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSubscriberBySlug.fulfilled, (state, action) => {
                state.currentSubscriber = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchSubscriberBySlug.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchSubscribers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSubscribers.fulfilled, (state, action) => {
                state.subscribers = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchSubscribers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

// Export actions and reducer
export const {
    setSubscribers,
    addSubscriber,
    updateSubscriber,
    deleteSubscriber,
    setCurrentSubscriber,
    clearCurrentSubscriber,
    setCachedSubscriber,
    setLoading,
    setError,
} = subscriberSlice.actions;

export default subscriberSlice.reducer;

// Selectors
export const selectSubscribers = (state: RootState) => state.subscriber.subscribers;
export const selectCurrentSubscriber = (state: RootState) => state.subscriber.currentSubscriber;
export const selectCachedSubscriber = (_id: string) => (state: RootState) =>
    state.subscriber.cachedSubscribers[_id];
export const selectIsLoading = (state: RootState) => state.subscriber.isLoading;
export const selectError = (state: RootState) => state.subscriber.error;
