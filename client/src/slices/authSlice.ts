import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  identifier: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  identifier: '',
  password: '',
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ field: 'identifier' | 'password'; value: string }>,
    ) => {
      state[action.payload.field] = action.payload.value;
    },
    clearCredentials: (state) => {
      state.identifier = '';
      state.password = '';
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
