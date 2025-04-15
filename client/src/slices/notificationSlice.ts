import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import axios from 'axios';

// Define specific types for notification metadata
export interface NotificationMetadata {
    targetId?: string;
    targetType?: 'article' | 'comment' | 'vote' | 'view' | 'subscriber' | 'user';
    action?: 'create' | 'update' | 'delete';
    additionalInfo?: Record<string, string>;
}

export interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    link: string;
    metadata: NotificationMetadata;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

interface NotificationState {
    items: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: NotificationState = {
    items: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
};

// Helper function to handle errors
const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || 'An error occurred while fetching notifications';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
};

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get<Notification[]>('/api/notifications');
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId: string, { rejectWithValue }) => {
        try {
            const response = await axios.patch<Notification>(`/api/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification(state, action: PayloadAction<Notification>) {
            state.items.unshift(action.payload);
            if (!action.payload.isRead) {
                state.unreadCount += 1;
            }
        },
        clearNotifications(state) {
            state.items = [];
            state.unreadCount = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.items = action.payload;
                state.unreadCount = action.payload.filter(item => !item.isRead).length;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                    if (state.unreadCount > 0) state.unreadCount -= 1;
                }
            });
    },
});

// Selectors
export const selectNotifications = (state: RootState) => state.notifications.items;
export const selectUnreadCount = (state: RootState) => state.notifications.unreadCount;
export const selectIsLoading = (state: RootState) => state.notifications.isLoading;
export const selectError = (state: RootState) => state.notifications.error;

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
