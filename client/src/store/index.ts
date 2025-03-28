import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/slices/userSlice';
import contactReducer from '@/slices/contactSlice';
import articleReducer from '@/slices/articleSlice';
import subscriberReducer from '@/slices/subscriberSlice';
import commentReducer from '@/slices/commentSlice';
import upvoteReducer from '@/slices/upvoteSlice';
import downvoteReducer from '@/slices/downvoteSlice';
import viewReducer from '@/slices/viewSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        contact: contactReducer,
        article: articleReducer,
        subscriber: subscriberReducer,
        comment: commentReducer,
        upvote: upvoteReducer,
        downvote: downvoteReducer,
        view: viewReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
