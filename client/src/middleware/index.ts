import { createAction, Middleware } from '@reduxjs/toolkit';
import { Socket } from 'socket.io-client';
import socket from '../socket';

import type { AppDispatch } from '@/store';
import { fetchNotifications } from '@/slices/notificationSlice';
import { fetchArticles } from '@/slices/articleSlice';
import { fetchComments } from '@/slices/commentSlice';
import { fetchSubscribers } from '@/slices/subscriberSlice';
import { fetchViews } from '@/slices/viewSlice';
import { fetchVotes } from '@/slices/voteSlice';

import type { NotificationPayload } from '@/types/notification';

// 1. Strictly‐typed action for socket events
export const addSocketNotification = createAction<NotificationPayload>(
    'notifications/addSocketNotification'
);

// 2. No explicit Middleware<…> annotation here: TS will infer
const socketMiddleware: Middleware = (storeAPI) => (next) => (action) => {
    const s = socket as Socket & { _initialized?: boolean };
    if (!s._initialized) {
        s._initialized = true;
        s.on('notification', (notif: NotificationPayload) => {
            // refresh from server
            (storeAPI.dispatch as AppDispatch)(fetchNotifications());
            // inject into UI
            (storeAPI.dispatch as AppDispatch)(addSocketNotification(notif));
            // cascade updates
            switch (notif.category) {
                case 'article':
                    (storeAPI.dispatch as AppDispatch)(fetchArticles());
                    break;
                case 'comment':
                    (storeAPI.dispatch as AppDispatch)(fetchComments());
                    break;
                case 'subscriber':
                    (storeAPI.dispatch as AppDispatch)(fetchSubscribers());
                    break;
                case 'view':
                    (storeAPI.dispatch as AppDispatch)(fetchViews());
                    break;
                case 'vote':
                    (storeAPI.dispatch as AppDispatch)(fetchVotes());
                    break;
            }
        });
    }
    return next(action);
};

// 3. Export default without aliasing—no circular references
export default socketMiddleware;
