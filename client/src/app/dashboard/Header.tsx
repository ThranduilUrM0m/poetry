'use client';
import React from 'react';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { selectUser } from '@/slices/userSlice';
import { createAvatar } from '@dicebear/core';
import { openPeeps } from '@dicebear/collection';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import { useDashboard } from '@/context/DashboardContext';

export default function Header() {
    const { isReady } = useDashboard();
    const user = useSelector(selectUser);

    // Avatar and color logic
    const avatar = React.useMemo(() => {
        return createAvatar(openPeeps, {
            size: 128,
            seed: 'Felix',
        }).toDataUri();
    }, []);

    const stringToColor = (str: string): string => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = hash % 360;
        const saturation = 70 + (hash % 15);
        const lightness = 45 + (hash % 10);
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    const createColorVariants = (baseColor: string) => {
        const [h, s, l] = baseColor.match(/\d+/g)?.map(Number) || [0, 0, 0];
        return {
            base: baseColor,
            light: `hsl(${h}, ${s}%, ${Math.min(l + 20, 95)}%)`,
            dark: `hsl(${h}, ${s}%, ${Math.max(l - 20, 5)}%)`,
            muted: `hsl(${h}, ${Math.max(s - 30, 10)}%, ${l}%)`,
        };
    };

    const userColor = user ? stringToColor(user.username || 'Anonymous') : '#888888';
    const colorVariants = createColorVariants(userColor);

    return (
        <AnimatedWrapper
            as="header"
            className="dashboard__main-header"
            from={{ opacity: 0.5 }}
            to={isReady ? { opacity: 1 } : undefined}
        >
            <div className="dashboard__main-header-left">
                <span className="dashboard__greeting">
                    Hello,{' '}
                    {_.isEmpty(user?.lastName) && _.isEmpty(user?.firstName)
                        ? user?.username
                        : !_.isEmpty(user?.lastName)
                        ? `${user?.firstName ?? ''} ${_.capitalize(
                              _.head(user?.lastName) || ''
                          )}.`.trim()
                        : user?.firstName ?? ''}
                </span>
                <span className="dashboard__welcome">Let&apos;s track your blog today!</span>
            </div>
            <div className="dashboard__main-header-right">
                <div className="dashboard__notifications">
                    <NotificationDropdown />
                </div>
                <div className="dashboard__avatar">
                    <div
                        className="avatar-circle"
                        style={{
                            background: `linear-gradient(135deg, ${colorVariants.light}, ${colorVariants.dark})`,
                            overflow: 'hidden',
                            borderRadius: '50%',
                        }}
                    >
                        <img
                            src={avatar}
                            alt="Avatar"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    </div>
                </div>
            </div>
        </AnimatedWrapper>
    );
}
