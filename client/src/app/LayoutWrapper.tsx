'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper.client';
import { LoadingContext } from '@/context/LoadingContext';
import { HeaderThemeProvider } from '@/context/HeaderThemeContext';
import { SearchModalProvider } from '@/context/SearchModalContext';
import SearchModal from '@/components/ui/SearchModal';
import { AppDispatch } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, selectUser } from '@/slices/userSlice';
import 'nprogress/nprogress.css';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPrivate = pathname?.startsWith('/dashboard') || pathname?.startsWith('/login');
    const [isLoaded, setIsLoaded] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector(selectUser);

    // Start NProgress on route change
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

    // If we're in a private path, ensure we have the user in Redux
    useEffect(() => {
        if (isPrivate && !user) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch, isPrivate, user]);

    return (
        <LoadingContext.Provider value={{ isLoaded }}>
            <HeaderThemeProvider>
                <SearchModalProvider>
                    {!isPrivate && (
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
                    {!isPrivate && (
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
                    <SearchModal />
                </SearchModalProvider>
            </HeaderThemeProvider>
        </LoadingContext.Provider>
    );
}
