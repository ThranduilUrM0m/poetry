import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Vote } from '@/types/article';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Base URL for the backend

interface VoteState {
    votes: Vote[];
    currentVote: Vote | null;
    cachedVotes: Record<string, Vote>;
    isLoading: boolean;
    error: string | null;
}

const initialState: VoteState = {
    votes: [],
    currentVote: null,
    cachedVotes: {},
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

// Fetch all votes using Axios
export const fetchVotes = createAsyncThunk('vote/fetchVotes', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get<Vote[]>(`${API_BASE_URL}/api/votes`);
        return response.data;
    } catch (error: unknown) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const fetchUpdatedVote = createAsyncThunk(
    'vote/fetchUpdatedVote',
    async (voteId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get<Vote>(`${API_BASE_URL}/api/votes/${voteId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const voteSlice = createSlice({
    name: 'vote',
    initialState,
    reducers: {
        setVotes(state, action: PayloadAction<Vote[]>) {
            state.votes = action.payload;
        },
        addVote(state, action: PayloadAction<Vote>) {
            state.votes = [...state.votes, action.payload];
        },
        updateVote(state, action: PayloadAction<Vote>) {
            state.votes = state.votes.map((vote) =>
                vote._id === action.payload._id ? action.payload : vote
            );
        },
        deleteVote(state, action: PayloadAction<string>) {
            state.votes = state.votes.filter((vote) => vote._id !== action.payload);
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
        .addCase(fetchUpdatedVote.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchUpdatedVote.fulfilled, (state, action) => {
            if (state.currentVote?._id === action.payload._id) {
                state.currentVote = action.payload;
            }
            state.isLoading = false;
        })
        .addCase(fetchUpdatedVote.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        })
            .addCase(fetchVotes.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchVotes.fulfilled, (state, action) => {
                state.votes = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchVotes.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch votes';
            });
    },
});

// Export actions and reducer
export const { setVotes, addVote, updateVote, deleteVote, setLoading, setError } =
    voteSlice.actions;

export default voteSlice.reducer;

// Selectors
export const selectVotes = (state: RootState) => state.vote.votes;
export const selectIsLoading = (state: RootState) => state.vote.isLoading;
export const selectError = (state: RootState) => state.vote.error;
