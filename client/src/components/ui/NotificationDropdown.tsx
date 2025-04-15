import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import {
    selectNotifications,
    selectUnreadCount,
    markAsRead,
    type Notification,
} from '@/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDropdown() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const notifications = useSelector(selectNotifications);
    const unreadCount = useSelector(selectUnreadCount);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleNotificationClick = async (notif: Notification) => {
        if (!notif.isRead) {
            await dispatch(markAsRead(notif._id));
        }
        setIsOpen(false);
        router.push(notif.link);
    };

    // Handle keyboard events for accessibility
    const handleKeyDown = (event: React.KeyboardEvent, notif: Notification) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleNotificationClick(notif);
        }
    };

    // Add smooth animation config
    const smoothConfig = { mass: 1, tension: 170, friction: 26 };

    return (
        <div className="notification-dropdown" ref={dropdownRef}>
            <button className="notification-trigger" onClick={() => setIsOpen(!isOpen)}>
                <Bell />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            <AnimatedWrapper
                as="div"
                className="notification-content"
                from={{ 
                    opacity: 0,
                    transform: 'translateY(-10px)'
                }}
                to={{ 
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateY(0px)' : 'translateY(-10px)'
                }}
                config={smoothConfig}
            >
                {notifications.length === 0 ? (
                    <div className="notification-empty">No notifications</div>
                ) : (
                    notifications.map((notif) => (
                        <button
                            key={notif._id}
                            className={`notification-item ${notif.isRead ? '' : 'unread'}`}
                            onClick={() => handleNotificationClick(notif)}
                            onKeyDown={(e) => handleKeyDown(e, notif)}
                            role="menuitem"
                            tabIndex={0}
                        >
                            <h4>{notif.title}</h4>
                            <p>{notif.message}</p>
                            <span className="notification-time">
                                {formatDistanceToNow(new Date(notif.createdAt), {
                                    addSuffix: true,
                                })}
                            </span>
                        </button>
                    ))
                )}
            </AnimatedWrapper>
        </div>
    );
}
