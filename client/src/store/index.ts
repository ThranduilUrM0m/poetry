import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/slices/authSlice';
import contactReducer from '@/slices/contactSlice';
import articleReducer from '@/slices/articleSlice';
import subscriberReducer from '@/slices/subscriberSlice';
import commentReducer from '@/slices/commentSlice';
import voteReducer from '@/slices/voteSlice';
import viewReducer from '@/slices/viewSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        contact: contactReducer,
        article: articleReducer,
        subscriber: subscriberReducer,
        comment: commentReducer,
        vote: voteReducer,
        view: viewReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
