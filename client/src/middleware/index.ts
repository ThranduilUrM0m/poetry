import { createAction, Middleware } from '@reduxjs/toolkit';
import { Socket } from 'socket.io-client';
import socket from '../socket';

import type { AppDispatch } from '@/store';
import { fetchNotifications } from '@/slices/notificationSlice';
import { fetchArticles } from '@/slices/articleSlice';
import { fetchCommentsByArticle } from '@/slices/commentSlice';
import { fetchSubscribers } from '@/slices/subscriberSlice';
import { fetchViews } from '@/slices/viewSlice';
import { fetchVotes } from '@/slices/voteSlice';

import type { NotificationPayload } from '@/types/notification';
import { selectUser } from '@/slices/userSlice';

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
            console.log('[SOCKET NOTIFICATION]', notif);

            const state = storeAPI.getState();
            const user = selectUser(state);

            // Only fetch notifications for logged-in users
            if (user) {
                (storeAPI.dispatch as AppDispatch)(fetchNotifications());
            }

            (storeAPI.dispatch as AppDispatch)(addSocketNotification(notif));

            switch (notif.category) {
                case 'article': {
                    (storeAPI.dispatch as AppDispatch)(fetchArticles());
                    break;
                }
                case 'comment': {
                    // Only fetch comments for the current article if it matches
                    const currentArticle = state.article?.currentArticle;
                    const notifArticleId = notif.metadata?.article;
                    if (currentArticle && notifArticleId === currentArticle._id) {
                        (storeAPI.dispatch as AppDispatch)(
                            fetchCommentsByArticle(currentArticle._id)
                        );
                    }
                    break;
                }
                case 'vote': {
                    // Only fetch votes for the current article or comment if it matches
                    const currentArticle = state.article?.currentArticle;
                    const notifArticleId = notif.metadata?.article || notif.metadata?.articleId;
                    if (currentArticle && notifArticleId === currentArticle._id) {
                        (storeAPI.dispatch as AppDispatch)(fetchVotes());
                    }
                    break;
                }
                case 'view': {
                    // Only fetch views for the current article if it matches
                    const currentArticle = state.article?.currentArticle;
                    const notifArticleId = notif.metadata?.article || notif.metadata?.articleId;
                    if (currentArticle && notifArticleId === currentArticle._id) {
                        (storeAPI.dispatch as AppDispatch)(fetchViews());
                    }
                    break;
                }
                case 'subscriber': {
                    // Only fetch subscribers if the user is an admin or on the dashboard
                    (storeAPI.dispatch as AppDispatch)(fetchSubscribers());
                    break;
                }
            }
        });
    }
    return next(action);
};

// 3. Export default without aliasing—no circular references
export default socketMiddleware;
