'use client';

import { usePathname } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AnimatePresence } from 'framer-motion';
import AnimatedWrapper from '../components/ui/AnimatedWrapper';

const headerVariants = {
    open: {
        y: 0,
		opacity: 1,
		transition: {
            duration: 0.25, // Speed of fade-out
            ease: 'easeInOut',
        },
    },
    closed: {
        y: -100,
		opacity: 0,
		transition: {
            duration: 0.25, // Speed of fade-out
            ease: 'easeInOut',
        },
    },
};

const footerVariants = {
    open: {
        y: 0,
		opacity: 1,
		transition: {
            duration: 0.25, // Speed of fade-out
            ease: 'easeInOut',
        },
    },
    closed: {
        y: 100,
		opacity: 0,
		transition: {
            duration: 0.25, // Speed of fade-out
            ease: 'easeInOut',
        },
    },
};

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith('/dashboard');

    return (
        <>
            {/* Animate Header */}
            {!isDashboard && (
                <AnimatePresence>
					<AnimatedWrapper
						variants={headerVariants}
						initial="closed" // Pass initial
						animate={'open'} // Pass animate
					>
                        <Header />
					</AnimatedWrapper>
                </AnimatePresence>
            )}

            {/* Children */}
            {children}

            {/* Animate Footer */}
            {!isDashboard && (
                <AnimatePresence>
					<AnimatedWrapper
						variants={footerVariants}
						initial="closed" // Pass initial
						animate={'open'} // Pass animate
					>
                        <Footer />
					</AnimatedWrapper>
                </AnimatePresence>
            )}
        </>
    );
}
