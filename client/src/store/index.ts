import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/slices/userSlice';
import articleReducer from '@/slices/articleSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        article: articleReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
