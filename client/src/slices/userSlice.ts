import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Author } from '@/types/article';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

interface UserState {
    user: Author | null;
    currentUser: Author | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: UserState = {
    user: null,
    currentUser: null,
    isLoading: false,
    error: null,
};

const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || 'An error occurred';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
};

export const fetchUserProfile = createAsyncThunk(
    'user/fetchProfile',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.token;
            if (!token) throw new Error('No token available');

            // Make the request to the new endpoint
            const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'user/updateProfile',
    async (userData: Partial<Author>, { getState, rejectWithValue }) => {
        try {
            const token = (getState() as RootState).auth.token;
            const response = await axios.patch(`${API_BASE_URL}/api/users/profile`, userData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<Author | null>) {
            state.user = action.payload;
        },
        setCurrentUser(state, action: PayloadAction<Author>) {
            state.currentUser = action.payload;
        },
        clearCurrentUser(state) {
            state.currentUser = null;
        },
        clearUserState(state) {
            state.user = null;
            state.currentUser = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setUser, setCurrentUser, clearCurrentUser, clearUserState } = userSlice.actions;
export default userSlice.reducer;

// Selectors
export const selectUser = (state: RootState) => state.user.user;
export const selectCurrentUser = (state: RootState) => state.user.currentUser;
export const selectUserIsLoading = (state: RootState) => state.user.isLoading;
export const selectUserError = (state: RootState) => state.user.error;
