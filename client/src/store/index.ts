import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/slices/userSlice';
import contactReducer from '@/slices/contactSlice';
import articleReducer from '@/slices/articleSlice';
import subscriberReducer from '@/slices/subscriberSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        contact: contactReducer,
        article: articleReducer,
        subscriber: subscriberReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
