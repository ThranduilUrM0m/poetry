﻿import { configureStore } from '@reduxjs/toolkit';
import socketMiddleware from '../middleware';

import authReducer from '@/slices/authSlice';
import contactReducer from '@/slices/contactSlice';
import articleReducer from '@/slices/articleSlice';
import subscriberReducer from '@/slices/subscriberSlice';
import commentReducer from '@/slices/commentSlice';
import voteReducer from '@/slices/voteSlice';
import viewReducer from '@/slices/viewSlice';
import analyticsReducer from '@/slices/analyticsSlice';
import userReducer from '@/slices/userSlice';
import notificationReducer from '@/slices/notificationSlice';
import tagReducer from '@/slices/tagSlice';
import fontsReducer from '@/slices/fontsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        contact: contactReducer,
        article: articleReducer,
        subscriber: subscriberReducer,
        comment: commentReducer,
        vote: voteReducer,
        view: viewReducer,
        analytics: analyticsReducer,
        user: userReducer,
        notifications: notificationReducer,
        tags: tagReducer,
        fonts: fontsReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(socketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
