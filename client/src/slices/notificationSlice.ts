// src/slices/notificationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import axios from 'axios';

// Flexible metadata typing
export type NotificationMetadata = Record<string, string | number | boolean>;

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

// Utility to extract error messages
const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || 'An error occurred while fetching data';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
};

// Thunks
export const fetchNotifications = createAsyncThunk<
    Notification[],
    void,
    { state: RootState; rejectValue: string }
>('notifications/fetchAll', async (_, { getState, rejectWithValue }) => {
    try {
        const token = (getState() as RootState).auth.token;
        const { data } = await axios.get<{
            items: Notification[];
            total: number;
            page: number;
        }>(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data.items;
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const fetchUnreadCount = createAsyncThunk<number, void, { state: RootState }>(
    'notifications/fetchUnreadCount',
    async (_, { getState, rejectWithValue }) => {
        const token = getState().auth.token;
        try {
            const { data } = await axios.get<{ count: number }>(
                `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/unread-count`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return data.count;
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const markAsRead = createAsyncThunk<
    Notification,
    string,
    { state: RootState; rejectValue: string }
>('notifications/markAsRead', async (notificationId, { getState, rejectWithValue }) => {
    try {
        const token = (getState() as RootState).auth.token;
        const response = await axios.patch<Notification>(
            `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const markAllRead = createAsyncThunk<void, void, { state: RootState; rejectValue: string }>(
    'notifications/markAllRead',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = (getState() as RootState).auth.token;
            await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const deleteNotification = createAsyncThunk<
    string,
    string,
    { state: RootState; rejectValue: string }
>('notifications/delete', async (notificationId, { getState, rejectWithValue }) => {
    try {
        const token = (getState() as RootState).auth.token;
        await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return notificationId;
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        // Real-time add
        addNotification(state, action: PayloadAction<Notification>) {
            state.items.unshift(action.payload);
            if (!action.payload.isRead) state.unreadCount++;
        },
        clearNotifications(state) {
            state.items = [];
            state.unreadCount = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchNotifications
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
                state.items = payload;
                state.unreadCount = payload.filter((n) => !n.isRead).length;
                state.isLoading = false;
            })
            .addCase(fetchNotifications.rejected, (state, { payload }) => {
                state.error = payload ?? 'Failed to fetch notifications';
                state.isLoading = false;
            })

            .addCase(fetchUnreadCount.fulfilled, (state, { payload }) => {
                state.unreadCount = payload;
            })

            // markAsRead
            .addCase(markAsRead.fulfilled, (state, { payload }) => {
                const idx = state.items.findIndex((n) => n._id === payload._id);
                if (idx !== -1) {
                    state.items[idx] = payload;
                    if (state.unreadCount > 0) state.unreadCount--;
                }
            })

            // markAllRead
            .addCase(markAllRead.fulfilled, (state) => {
                state.items = state.items.map((n) => ({ ...n, isRead: true }));
                state.unreadCount = 0;
            })

            // deleteNotification
            .addCase(deleteNotification.fulfilled, (state, { payload }) => {
                state.items = state.items.filter((n) => n._id !== payload);
            });
    },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export const selectNotifications = (state: RootState) => state.notifications.items;
export const selectUnreadCount = (state: RootState) => state.notifications.unreadCount;
export default notificationSlice.reducer;
