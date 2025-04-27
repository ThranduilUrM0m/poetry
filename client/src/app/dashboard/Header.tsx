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
import chroma from 'chroma-js';

// 1. Base HSL from CSS variables
const PRIMARY_HSL = [217, 45, 65];

// 2. Deterministic hash → hue within ±Δ of baseHue
const stringToBrandColor = (str: string, delta = 15) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Map hash to [-delta, delta]
    const shift = ((hash % (2 * delta)) - delta + 360) % 360;
    const hue = (PRIMARY_HSL[0] + shift + 360) % 360;
    return chroma.hsl(hue, PRIMARY_HSL[1] / 100, PRIMARY_HSL[2] / 100).css();
    // returns 'hsl(hue, sat%, light%)'
};

// 3. Variant generator using chroma.js
const createColorVariants = (baseColor: string) => {
    const c = chroma(baseColor);
    return {
        base: c.css(),
        light: c.luminance(Math.min(c.luminance() + 0.2, 1)).css(),
        dark: c.darken(1).css(),
        muted: c.desaturate(1).css(),
    };
};

export default function Header() {
    const { isReady } = useDashboard();
    const user = useSelector(selectUser);

    // Avatar and color logic
    const avatar = React.useMemo(() => {
        return createAvatar(openPeeps, {
            seed: 'Aiden',
            flip: true,
            backgroundType: [],
            accessories: ['glasses', 'glasses2', 'glasses3', 'glasses4', 'glasses5'],
            accessoriesProbability: 50,
            face: ['smileBig'],
            facialHair: [],
            facialHairProbability: 0,
            head: ['bangs', 'grayMedium'],
            mask: [],
            maskProbability: 0,
        }).toDataUri();
    }, []);

    const brandColor = stringToBrandColor(user?.username || 'Aiden');;
    const { light, dark, muted } = createColorVariants(brandColor);

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
                    <span>
                        <p>{_.capitalize(user?.email)}</p>
                        <p>
                            {'@' +
                                user?.username +
                                ' - ' +
                                (!_.isEmpty(user?.city)
                                    ? user?.city + ', ' + user?.country?._country
                                    : user?.country?._country)}
                        </p>
                    </span>
                    <div
                        className="avatar-circle"
                        style={{
                            background: `linear-gradient(135deg, ${light}, ${dark})`,
                            borderColor: muted,
                            // Use CSS vars to allow runtime theming:
                            // background: `linear-gradient(135deg, var(--avatar-light), var(--avatar-dark))`,
                            // borderColor: `var(--avatar-muted)`,
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
