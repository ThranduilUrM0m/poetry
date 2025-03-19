// components/SectionObserver.tsx
'use client';
import React, { useEffect, useRef, ReactNode } from 'react';
import { useHeaderTheme } from '@/context/HeaderThemeContext';

interface SectionObserverProps {
    theme: 'light' | 'dark';
    children: ReactNode;
}

const SectionObserver = ({ theme, children }: SectionObserverProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const { setTheme } = useHeaderTheme();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTheme(theme);
                }
            },
            {
                threshold: 0.5, // Adjust as needed for your design
            }
        );
        if (ref.current) observer.observe(ref.current);
        return () => {
            observer.disconnect();
        };
    }, [theme, setTheme]);

    return <div ref={ref}>{children}</div>;
};

export default SectionObserver;
