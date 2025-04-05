import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Base URL for the backend

interface User {
    _id: string;
    _user_email: string;
    _user_username: string;
    _user_password: string;
    _user_fingerprint?: string;
    _user_picture?: string;
    _user_firstname?: string;
    _user_lastname?: string;
    _user_city?: string;
    _user_country?: {
        _code: string;
        _country: string;
    };
    _user_phone?: string;
    _user_isVerified?: boolean;
    _user_toDelete?: boolean;
    _user_isActive?: boolean;
    _user_teams?: Array<{
        Team: string;
        assignedFunction: Array<{
            __title: string;
            __description?: string;
        }>;
    }>;
    Article?: string[];
    Department?: string[];
    Expertise?: string;
    Role?: string[];
}

interface UserState {
    isAuthenticated: boolean;
    user: User | null;
    users: User[];
    currentUser: User | null;
    cachedUsers: Record<string, User>;
    userToEdit: User | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: UserState = {
    isAuthenticated: false,
    user: null,
    currentUser: null,
    cachedUsers: {},
    users: [],
    userToEdit: null,
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

/* Needs base url */
export const loginUser = createAsyncThunk(
    'user/login',
    async (credentials: { _user_identification: string; _user_password: string }, thunkAPI) => {
        try {
            const response = await axios.post('/auth/login', credentials);
            return response.data.user;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export const fetchUsers = createAsyncThunk('user/fetchUsers', async (_, thunkAPI) => {
    try {
        const response = await axios.get('/users');
        return response.data.users;
    } catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

export const fetchUpdatedUser = createAsyncThunk(
    'user/fetchUpdatedUser',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await axios.get<User>(`${API_BASE_URL}/api/users/${userId}`);
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
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        clearUser(state) {
            state.user = null;
            state.isAuthenticated = false;
        },
        addUser(state, action: PayloadAction<User>) {
            state.users.push(action.payload);
        },
        deleteUser(state, action: PayloadAction<string>) {
            state.users = state.users.filter((user) => user._id !== action.payload);
        },
        updateUser(state, action: PayloadAction<User>) {
            const index = state.users.findIndex((user) => user._id === action.payload._id);
            if (index !== -1) {
                state.users[index] = action.payload;
            }
        },
        setUsers(state, action: PayloadAction<User[]>) {
            state.users = action.payload;
        },
        clearUsers(state) {
            state.users = [];
        },
        setUserToEdit(state, action: PayloadAction<User>) {
            state.userToEdit = action.payload;
        },
        clearUserToEdit(state) {
            state.userToEdit = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUpdatedUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUpdatedUser.fulfilled, (state, action) => {
                if (state.currentUser?._id === action.payload._id) {
                    state.currentUser = action.payload;
                }
                state.isLoading = false;
            })
            .addCase(fetchUpdatedUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
                state.users = action.payload;
            });
    },
});

export const {
    setUser,
    clearUser,
    addUser,
    deleteUser,
    updateUser,
    setUsers,
    clearUsers,
    setUserToEdit,
    clearUserToEdit,
} = userSlice.actions;

export default userSlice.reducer;
