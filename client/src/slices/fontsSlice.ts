// frontend/store/slices/fontsSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import axios from 'axios';

// 1. Define the slice state
interface FontState {
    list: string[];
    isLoading: boolean;
    error: string | null;
}

// 2. Initial state: empty list
const initialState: FontState = {
    list: [],
    isLoading: false,
    error: null,
};

// 3. Async thunk to fetch the font families
export const fetchFontList = createAsyncThunk<
    string[], // returned payload type
    void, // thunk argument (none)
    { rejectValue: string }
>('fonts/fetchList', async (_args, { rejectWithValue }) => {
    try {
        const { data } = await axios.get<string[]>(`${process.env.NEXT_PUBLIC_API_URL}/fonts`);
        return data;
    } catch (err) {
        console.warn('Failed to fetch font list:', err);
        return rejectWithValue('Could not load fonts');
    }
});

// 4. Create the slice
const fontSlice = createSlice({
    name: 'fonts',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFontList.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchFontList.fulfilled, (state, action) => {
                state.list = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchFontList.rejected, (state, action) => {
                state.list = []; // fallback to empty or some default
                state.isLoading = false;
                state.error = action.payload || action.error.message || null;
            });
    },
});

// 5. Selectors for components
export const selectFontList = (state: RootState) => state.fonts.list;
export const selectFontsLoading = (state: RootState) => state.fonts.isLoading;
export const selectFontsError = (state: RootState) => state.fonts.error;

// 6. Export the reducer
export default fontSlice.reducer;
