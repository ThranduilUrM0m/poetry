import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Author } from '@/types/article';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Your backend URL

// Define the authentication state interface.
interface AuthState {
    token: string | null;
    user: Author | null; // Optionally, replace `any` with your user type.
    isLoading: boolean;
    error: string | null;
}

// Initialize the authentication state.
const initialState: AuthState = {
    token: null,
    user: null,
    isLoading: false,
    error: null,
};

// Utility function to extract error messages.
const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || 'An error occurred during authentication';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
};

// Async thunk to handle user login.
// It expects an object with `login` (email or username) and `password`.
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: { login: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
            // The backend returns an object like: { access_token: string }
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

// Create the authentication slice.
export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // A simple logout reducer that resets the auth state.
        logout(state) {
            state.token = null;
            state.user = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(
                loginUser.fulfilled,
                (state, action: PayloadAction<{ access_token: string }>) => {
                    state.token = action.payload.access_token;
                    state.isLoading = false;
                    // Optionally: decode token to set user data if needed.
                }
            )
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

// Export actions and selectors.
export const { logout } = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;
