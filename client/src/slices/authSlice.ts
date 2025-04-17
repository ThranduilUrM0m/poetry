// src/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

interface AuthState {
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Get initial token from localStorage
const getInitialToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const initialState: AuthState = {
  token: getInitialToken(),
  isLoading: false,
  error: null,
};

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || 'An error occurred during authentication';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { login: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
      // Expecting response.data.access_token only.
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      if (typeof window !== 'undefined') {
        if (action.payload) {
          localStorage.setItem('token', action.payload);
        } else {
          localStorage.removeItem('token');
        }
      }
    },
    clearAuth: (state) => {
      state.token = null;
      state.error = null;
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
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.access_token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', action.payload.access_token);
        }
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setToken, clearAuth, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
export const selectAuthIsLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
