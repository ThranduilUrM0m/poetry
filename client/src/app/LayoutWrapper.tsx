'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import { LoadingContext } from '@/context/LoadingContext';

const headerVariants = {
    initial: { translateY: -100, opacity: 0 },
    animate: { translateY: 0, opacity: 1, transition: { duration: 0.5 } },
};

const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
};

const footerVariants = {
    initial: { translateY: 100, opacity: 0 },
    animate: { translateY: 0, opacity: 1, transition: { duration: 0.5, delay: 0.4 } },
};

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith('/dashboard');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        NProgress.start();
        setIsLoaded(false);

        const timer = setTimeout(() => {
            NProgress.done();
            setIsLoaded(true);
        }, 500);

        return () => {
            clearTimeout(timer);
            NProgress.done();
        };
    }, [pathname]);

    return (
        <LoadingContext.Provider value={{ isLoaded }}>
            {!isDashboard && (
                <AnimatedWrapper
                    className="__headerWrapper"
                    variants={headerVariants}
                    initial="initial"
                    animate={isLoaded ? 'animate' : 'initial'}
                >
                    <Header />
                </AnimatedWrapper>
            )}

            <AnimatedWrapper
                className="__mainWrapper"
                variants={contentVariants}
                initial="initial"
                animate={isLoaded ? 'animate' : 'initial'}
            >
                {children}
            </AnimatedWrapper>

            {!isDashboard && (
                <AnimatedWrapper
                    className="__footerWrapper"
                    variants={footerVariants}
                    initial="initial"
                    animate={isLoaded ? 'animate' : 'initial'}
                >
                    <Footer />
                </AnimatedWrapper>
            )}
        </LoadingContext.Provider>
    );
}
