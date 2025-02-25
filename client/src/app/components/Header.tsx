'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import AnimatedWrapper from './ui/AnimatedWrapper';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/app/assets/images/b_white_orange..svg';
import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import SearchModal from './ui/SearchModal';
/* import NewsletterPopup from './ui/NewsletterPopup'; */

const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
];

const useDimensions = (ref: React.RefObject<HTMLDivElement | null>) => {
    const dimensions = useRef({ width: 0, height: 0 });

    useEffect(() => {
        if (ref.current) {
            dimensions.current.width = ref.current.offsetWidth;
            dimensions.current.height = ref.current.offsetHeight;
        }
    }, [ref]);

    return dimensions.current;
};

const overlayVariants = {
    open: {
        display: 'block',
        opacity: 1,
        backdropFilter: 'blur(.25vh)',
        transition: {
            duration: 0.25,
            ease: 'easeInOut',
        },
    },
    closed: {
        display: 'none',
        opacity: 0,
        backdropFilter: 'blur(0vh)',
        transition: {
            duration: 0.25,
            ease: 'easeInOut',
        },
    },
};

const sidebarVariants = {
    open: {
        clipPath: 'circle(150vh at 15vh 5vh)',
        transition: {
            type: "spring",
            stiffness: 20,
            restDelta: 2,
        },
    },
    closed: {
        clipPath: 'circle(0vh at 15vh 5vh)',
        transition: {
            delay: 0.2,
            type: "spring",
            stiffness: 400,
            damping: 40,
        },
    },
};

const navVariants = {
    open: {
        transition: { staggerChildren: 0.07, delayChildren: 0.2 },
    },
    closed: {
        transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
};

const itemVariants = {
    open: {
        y: 0,
        opacity: 1,
        transition: {
            y: { stiffness: 1000, velocity: -100 },
        },
    },
    closed: {
        y: 50,
        opacity: 0,
        transition: {
            y: { stiffness: 1000 },
        },
    },
};

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const pathname = usePathname();
    const menuRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const backgroundRef = useRef<HTMLDivElement>(null);
    const { height } = useDimensions(menuRef);

    const getHeaderClass = () => {
        if (pathname === '/login') return 'header _login';
        if (pathname === '/dashboard') return 'header _dashboard';
        return 'header';
    };

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMenuOpen) {
                setIsMenuOpen(!isMenuOpen);
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (overlayRef.current && overlayRef.current.contains(event.target as Node)) {
                // Click is on the overlay; close the menu
                setIsMenuOpen(false);
            } else if (
                backgroundRef.current &&
                backgroundRef.current.contains(event.target as Node)
            ) {
                // Click is inside the background; keep the menu open
                return;
            }
        };

        if (isMenuOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen, setIsMenuOpen]);

    return (
        <header className={getHeaderClass()}>
            <nav className="header__nav">
                <div className="header__nav-left">
                    {/* Overlay */}
                    <AnimatePresence>
                        <AnimatedWrapper
                            as="div"
                            className="__overlay"
                            ref={overlayRef}
                            variants={overlayVariants}
                            initial="closed" // Pass initial
                            animate={isMenuOpen ? 'open' : 'closed'} // Pass animate
                            exit="closed" // Pass exit
                            transition={{ duration: 0.5 }} // Pass transition
                        ></AnimatedWrapper>
                    </AnimatePresence>

                    <AnimatePresence>
                        <AnimatedWrapper
                            as="nav"
                            className="header__nav-left-hamburger"
                            initial={false}
                            animate={isMenuOpen ? 'open' : 'closed'}
                            custom={height}
                            ref={menuRef}
                        >
                            {/* __background */}
                            <AnimatePresence>
                                <AnimatedWrapper
                                    as="div"
                                    className="__background"
                                    ref={backgroundRef}
                                    variants={sidebarVariants}
                                    initial="closed" // Pass initial
                                    animate={isMenuOpen ? 'open' : 'closed'} // Pass animate
                                    exit="closed" // Pass exit
                                ></AnimatedWrapper>
                            </AnimatePresence>

                            {/* __ul */}
                            <AnimatePresence>
                                <AnimatedWrapper
                                    as="ul"
                                    className="__ul"
                                    variants={navVariants}
                                    initial="closed"
                                    animate={isMenuOpen ? 'open' : 'closed'} // Ensure this is toggling correctly
                                >
                                    {menuItems.map((item) => (
                                        <AnimatedWrapper
                                            as="li"
                                            key={item.href}
                                            variants={itemVariants}
                                            initial="closed"
                                            animate={isMenuOpen ? 'open' : 'closed'} // Matches parent's animate state
                                            exit="closed"
                                            whileHover={{ scale: 1.16 }}
                                            whileTap={{ scale: 0.5 }}
                                        >
                                            <Link
                                                href={item.href}
                                                className={`${
                                                    pathname === item.href ? 'active' : ''
                                                }`}
                                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                            >
                                                {item.label}
                                            </Link>
                                        </AnimatedWrapper>
                                    ))}
                                </AnimatedWrapper>
                            </AnimatePresence>

                            {/* __hamburger */}
                            <AnimatePresence>
                                <AnimatedWrapper
                                    as="button"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                                    className="__hamburger"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.5 }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 100 100"
                                        className={`${isMenuOpen ? 'isMenuOpen' : ''}`}
                                    >
                                        <g>
                                            <line
                                                className="one"
                                                x1={`${isMenuOpen ? '24.5' : '19.5'}`}
                                                y1={`${isMenuOpen ? '49.5' : '43.5'}`}
                                                x2={`${isMenuOpen ? '75.5' : '80.5'}`}
                                                y2={`${isMenuOpen ? '49.5' : '43.5'}`}
                                            ></line>
                                            <line
                                                className="two"
                                                x1={`${isMenuOpen ? '24.5' : '19.5'}`}
                                                y1={`${isMenuOpen ? '50.5' : '56.5'}`}
                                                x2={`${isMenuOpen ? '75.5' : '80.5'}`}
                                                y2={`${isMenuOpen ? '50.5' : '56.5'}`}
                                            ></line>
                                        </g>
                                    </svg>
                                </AnimatedWrapper>
                            </AnimatePresence>
                        </AnimatedWrapper>
                    </AnimatePresence>

                    <Link href="/" className="header__nav-left-logo">
                        <Image src={logo} alt="Logo" width={32} height={32} />
                    </Link>
                </div>
                <div className="header__nav-right">
                    <AnimatedWrapper
                        as="button"
                        onClick={() => setIsSearchOpen(true)}
                        className="header__nav-actions-search"
                        whileHover={{ scale: 1.16 }}
                        whileTap={{ scale: 0.5 }}
                    >
                        <Search />
                    </AnimatedWrapper>
                </div>
            </nav>

            <SearchModal isSearchOpen={isSearchOpen} onSearchClose={() => setIsSearchOpen(false)} />
        </header>
    );
}
