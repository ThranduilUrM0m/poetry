'use client';
import { useEffect, useRef, useState } from 'react';
import { config } from '@react-spring/web';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';
import Overlay from '@/components/ui/Overlay';
import SearchModal from '@/components/ui/SearchModal';
import { useHeaderTheme } from '@/context/HeaderThemeContext';
import logo from '@/assets/images/b_white_orange..svg';

const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
];

export default function Header() {
    const { theme } = useHeaderTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const pathname = usePathname();
    const menuRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const backgroundRef = useRef<HTMLDivElement>(null);

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
                setIsMenuOpen(false);
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
    }, [isMenuOpen]);

    // Smooth beautiful config
    const smoothConfig = { mass: 1, tension: 170, friction: 26 };

    // Update the config to be used for all hamburger animations
    const hamburgerConfig = {
        ...config.wobbly,
        duration: 300, // Add a consistent duration
    };

    // Add stagger timing configuration
    const staggerConfig = {
        backgroundDuration: 600, // Background animation duration in ms
        itemStaggerDelay: 100, // Delay between each item in ms
        getItemDelay: (index: number) => index * 100, // New helper function
    };

    const menuItemElements = menuItems.map((item) => {
        return (
            <AnimatedWrapper
                as="li"
                key={item.href}
                hover={{ from: { scale: 1 }, to: { scale: 1.1 } }}
                click={{ from: { scale: 1 }, to: { scale: 0.9 } }}
            >
                <Link
                    href={item.href}
                    className={`${pathname === item.href ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {item.label}
                </Link>
            </AnimatedWrapper>
        );
    });

    return (
        <header className={getHeaderClass()}>
            <nav className="header__nav">
                <div className="header__nav-left">
                    {/* Overlay for the menu */}
                    {isMenuOpen && (
                        <Overlay
                            isVisible={isMenuOpen}
                            onClick={() => setIsMenuOpen(false)}
                            zIndex={10}
                        />
                    )}
                    <div className="header__nav-left-hamburger" ref={menuRef}>
                        {/* Sidebar background */}
                        <AnimatedWrapper
                            as="div"
                            className="__background"
                            ref={backgroundRef}
                            from={{ clipPath: 'circle(0vh at 15vh 5vh)' }}
                            to={{
                                clipPath: isMenuOpen
                                    ? 'circle(150vh at 15vh 5vh)'
                                    : 'circle(0vh at 15vh 5vh)',
                            }}
                            config={{ ...smoothConfig, duration: staggerConfig.backgroundDuration }}
                        >
                            {/* Menu items */}
                            <AnimatedWrapper
                                as="ul"
                                className="__ul"
                                from={{ opacity: 0 }}
                                to={{ opacity: isMenuOpen ? 1 : 0 }}
                                config={smoothConfig}
                                delay={staggerConfig.backgroundDuration * 0.5} // Start halfway through background animation
                                trail={{
                                    items: menuItemElements,
                                    from: {
                                        transform: 'translateX(-50px)',
                                        opacity: 0,
                                    },
                                    to: {
                                        transform: isMenuOpen
                                            ? 'translateX(0)'
                                            : 'translateX(-50px)',
                                        opacity: isMenuOpen ? 1 : 0,
                                    },
                                    config: smoothConfig,
                                    delay: isMenuOpen
                                        ? staggerConfig.backgroundDuration
                                        : staggerConfig.backgroundDuration +
                                          staggerConfig.itemStaggerDelay * (menuItems.length - 1),
                                }}
                            >
                                {menuItemElements.map((element) => {
                                    return element;
                                })}
                            </AnimatedWrapper>
                        </AnimatedWrapper>
                        {/* Hamburger button */}
                        <AnimatedWrapper
                            as="button"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                            className="__hamburger"
                            from={{ transform: 'rotate(0deg)' }}
                            to={{ transform: isMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                            hover={{ from: { scale: 1 }, to: { scale: 1.1 } }}
                            click={{ from: { scale: 1 }, to: { scale: 0.9 } }}
                            config={hamburgerConfig}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 100 100"
                                className={`${isMenuOpen ? 'isMenuOpen' : ''}`}
                            >
                                <g>
                                    <AnimatedWrapper
                                        as="line"
                                        className="one"
                                        x1="24.5"
                                        y1="43.5"
                                        x2="75.5"
                                        y2="43.5"
                                        from={{
                                            transform: 'translate(0, 0) rotate(0deg)',
                                            transformOrigin: 'center',
                                        }}
                                        to={{
                                            transform: isMenuOpen
                                                ? 'translate(0, 6px) rotate(45deg)'
                                                : 'translate(0, 0) rotate(0deg)',
                                            transformOrigin: 'center',
                                        }}
                                        config={hamburgerConfig}
                                    />
                                    <AnimatedWrapper
                                        as="line"
                                        className="two"
                                        x1="24.5"
                                        y1="56.5"
                                        x2="75.5"
                                        y2="56.5"
                                        from={{
                                            transform: 'translate(0, 0) rotate(0deg)',
                                            transformOrigin: 'center',
                                        }}
                                        to={{
                                            transform: isMenuOpen
                                                ? 'translate(0, -6px) rotate(-45deg)'
                                                : 'translate(0, 0) rotate(0deg)',
                                            transformOrigin: 'center',
                                        }}
                                        config={hamburgerConfig}
                                    />
                                </g>
                            </svg>
                        </AnimatedWrapper>
                    </div>
                    <Link href="/" className="header__nav-left-logo">
                        <Image src={logo} alt="Logo" width={32} height={32} />
                    </Link>
                </div>
                <div className="header__nav-right">
                    {/* Search button */}
                    <AnimatedWrapper
                        as="button"
                        onClick={() => setIsSearchOpen(true)}
                        className={`header__nav-right-search ${
                            theme === 'dark' ? '__dark' : '__white'
                        }`}
                        config={smoothConfig}
                        hover={{ from: { scale: 1 }, to: { scale: 1.16 } }}
                        click={{ from: { scale: 1 }, to: { scale: 0.5 } }}
                    >
                        <Search />
                    </AnimatedWrapper>
                </div>
            </nav>
            <SearchModal isSearchOpen={isSearchOpen} onSearchClose={() => setIsSearchOpen(false)} />
        </header>
    );
}
