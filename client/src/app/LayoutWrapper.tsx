'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';

const headerVariants = {
    open: {
        translateY: 0, // Use translateY instead of y
        opacity: 1,
        transition: {
            duration: 0.25,
            ease: 'easeInOut',
        },
    },
    closed: {
        translateY: -100, // Use translateY instead of y
        opacity: 0,
        transition: {
            duration: 0.25,
            ease: 'easeInOut',
        },
    },
};

const footerVariants = {
    open: {
        translateY: 0, // Use translateY instead of y
        opacity: 1,
        transition: {
            duration: 0.25,
            ease: 'easeInOut',
        },
    },
    closed: {
        translateY: 100, // Use translateY instead of y
        opacity: 0,
        transition: {
            duration: 0.25,
            ease: 'easeInOut',
        },
    },
};

export default function LayoutWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith('/dashboard');

    return (
        <>
            {/* Animate Header */}
            {!isDashboard && (
                <AnimatedWrapper
                    as={React.Fragment}
                    variants={headerVariants}
                    initial="closed" // Start from the "closed" state
                    animate="open" // Animate to the "open" state
                    transition={{ duration: 0.25, ease: 'easeInOut' }} // Add transition here
                >
                    <Header />
                </AnimatedWrapper>
            )}

            {/* Children */}
            {children}

            {/* Animate Footer */}
            {!isDashboard && (
                <AnimatedWrapper
                    as={React.Fragment}
                    variants={footerVariants}
                    initial="closed" // Pass initial
                    animate={'open'} // Pass animate
                    transition={{ duration: 0.25, ease: 'easeInOut' }} // Add transition here
                >
                    <Footer />
                </AnimatedWrapper>
            )}
        </>
    );
}
