'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import { LoadingContext } from '@/context/LoadingContext';
import { HeaderThemeProvider } from '@/context/HeaderThemeContext';
import 'nprogress/nprogress.css';

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
            <HeaderThemeProvider>
                {!isDashboard && (
                    <AnimatedWrapper
                        className="__headerWrapper"
                        from={{ transform: 'translateY(-100%)', opacity: 0 }}
                        to={{
                            transform: isLoaded ? 'translateY(0)' : 'translateY(-100%)',
                            opacity: isLoaded ? 1 : 0,
                        }}
                        config={{ mass: 1, tension: 170, friction: 26 }}
                    >
                        <Header />
                    </AnimatedWrapper>
                )}
                <AnimatedWrapper
                    className="__mainWrapper"
                    from={{ transform: 'translateY(-20%)', opacity: 0 }}
                    to={{
                        transform: isLoaded ? 'translateY(0)' : 'translateY(-20%)',
                        opacity: isLoaded ? 1 : 0,
                    }}
                    config={{ mass: 1, tension: 170, friction: 26 }}
                >
                    {children}
                </AnimatedWrapper>
                {!isDashboard && (
                    <AnimatedWrapper
                        className="__footerWrapper"
                        from={{ transform: 'translateY(100%)', opacity: 0 }}
                        to={{
                            transform: isLoaded ? 'translateY(0)' : 'translateY(100%)',
                            opacity: isLoaded ? 1 : 0,
                        }}
                        config={{ mass: 1, tension: 170, friction: 26 }}
                    >
                        <Footer />
                    </AnimatedWrapper>
                )}
            </HeaderThemeProvider>
        </LoadingContext.Provider>
    );
}
