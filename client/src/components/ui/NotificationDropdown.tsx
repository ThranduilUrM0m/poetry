import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchNotifications,
    markAsRead,
    markAllRead,
    selectNotifications,
    selectUnreadCount,
    fetchUnreadCount,
} from '@/slices/notificationSlice';
import type { Notification } from '@/slices/notificationSlice';
import { LuBellRing } from 'react-icons/lu';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper.client';
import { formatDistanceToNow } from 'date-fns';
import { AppDispatch } from '@/store';
import { useRouter } from 'next/navigation';
import SimpleBar from 'simplebar-react';
import { useTransition } from '@react-spring/web';

export default function NotificationDropdown() {
    const dispatch = useDispatch<AppDispatch>();
    const notifications = useSelector(selectNotifications);
    const unreadCount = useSelector(selectUnreadCount);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch on mount
    useEffect(() => {
        dispatch(fetchNotifications());
        dispatch(fetchUnreadCount());
    }, [dispatch]);

    // Click-away to close
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

    const handleClick = async (notif: Notification) => {
        if (!notif.isRead) await dispatch(markAsRead(notif._id));
        setIsOpen(false);
        router.push(notif.link);
    };

    // Animation config (same as FormField)
    const smoothConfig = { mass: 1, tension: 170, friction: 26 };

    // Dropdown transition (same as selectTransition in FormField)
    const dropdownTransition = useTransition(isOpen, {
        from: { opacity: 0, transform: 'translateY(-10%)' },
        enter: { opacity: 1, transform: 'translateY(0)' },
        leave: { opacity: 0, transform: 'translateY(-10%)' },
        config: smoothConfig,
    });

    return (
        <div className="_customSelectWrapper notification-dropdown" ref={dropdownRef}>
            <button
                className="notification-trigger _input __select"
                onClick={() => setIsOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                style={{ position: 'relative' }}
            >
                <LuBellRing />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        <div>{unreadCount > 99 ? '99+' : unreadCount}</div>
                    </span>
                )}
            </button>
            {dropdownTransition(
                (style, open) =>
                    open && (
                        <AnimatedWrapper as="div" animationStyle={style}>
                            <SimpleBar
                                className="_SimpleBar"
                                style={{ maxHeight: '50vh' }}
                                forceVisible="y"
                                autoHide={false}
                            >
                                <ul className="_SimpleBar-Group">
                                    <div className="dropdown-header">
                                        <span className="title">Notifications</span>
                                        <button onClick={() => dispatch(markAllRead())}>
                                            Mark All Read
                                        </button>
                                    </div>

                                    {notifications.length === 0 ? (
                                        <div className="empty-notifications">No notifications</div>
                                    ) : (
                                        <ul className="_SimpleBar-Group">
                                            {notifications.map((n) => (
                                                <li
                                                    key={n._id}
                                                    className={`suggestion-item ${
                                                        !n.isRead ? 'unread' : ''
                                                    }`}
                                                    onClick={() => handleClick(n)}
                                                    role="option"
                                                    aria-selected={!n.isRead}
                                                >
                                                    <span className="item-title">{n.title}</span>
                                                    <span className="item-message">
                                                        {n.message}
                                                    </span>
                                                    <span className="item-timestamp">
                                                        {formatDistanceToNow(
                                                            new Date(n.createdAt),
                                                            { addSuffix: true }
                                                        )}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </ul>
                            </SimpleBar>
                        </AnimatedWrapper>
                    )
            )}
        </div>
    );
}
