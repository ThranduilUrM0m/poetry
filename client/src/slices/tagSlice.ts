import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import axios from 'axios';
import { commonDevTags } from '@/utils/tagSuggestions';

interface TagState {
    suggestions: string[];
    isLoading: boolean;
    error: string | null;
}

const initialState: TagState = {
    suggestions: commonDevTags,
    isLoading: false,
    error: null,
};

export const fetchTagSuggestions = createAsyncThunk<
    string[],
    { input: string; content: string },
    { rejectValue: string[] }
>('tags/fetchSuggestions', async ({ input, content }, { rejectWithValue }) => {
    try {
        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze-comment/suggest-tags`, {
            input,
            content,
        });
        return data;
    } catch (err) {
        console.warn('Falling back to commonDevTags:', err);
        return rejectWithValue(commonDevTags);
    }
});

const tagSlice = createSlice({
    name: 'tags',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTagSuggestions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTagSuggestions.fulfilled, (state, action) => {
                state.suggestions = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchTagSuggestions.rejected, (state, action) => {
                state.suggestions = action.payload ?? commonDevTags;
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch tags';
            });
    },
});

export const selectTagSuggestions = (state: RootState) => state.tags.suggestions;
export const selectTagsLoading = (state: RootState) => state.tags.isLoading;
export const selectTagsError = (state: RootState) => state.tags.error;
export default tagSlice.reducer;
