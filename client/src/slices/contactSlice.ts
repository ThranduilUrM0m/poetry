import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '@/store';

const API_BASE_URL = 'http://localhost:5000'; // Base URL for the backend

interface ContactState {
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: ContactState = {
    isLoading: false,
    error: null,
    successMessage: null,
};

export const sendContactEmail = createAsyncThunk(
    'contact/sendContactEmail',
    async (formData: { email: string; phone: string; firstname: string; lastname: string; message: string }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/contact`, formData);
            return response.data.message;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return rejectWithValue(error.response.data.message || 'Failed to send message');
            }
            return rejectWithValue('Failed to send message');
        }
    }
);

const contactSlice = createSlice({
    name: 'contact',
    initialState,
    reducers: {
        clearContactState: (state) => {
            state.isLoading = false;
            state.error = null;
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendContactEmail.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(sendContactEmail.fulfilled, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.successMessage = action.payload;
            })
            .addCase(sendContactEmail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearContactState } = contactSlice.actions;

export default contactSlice.reducer;

// Selectors
export const selectIsLoading = (state: RootState) => state.contact.isLoading;
export const selectError = (state: RootState) => state.contact.error;
export const selectSuccessMessage = (state: RootState) => state.contact.successMessage;

