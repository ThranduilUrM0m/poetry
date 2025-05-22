'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { config } from '@react-spring/web';
import Link from 'next/link';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper.client';
import { useOverlay } from '@/context/OverlayContext';
import { useSearchModal } from '@/context/SearchModalContext';
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
    const pathname = usePathname();
    const { showOverlay, hideOverlay } = useOverlay();
    const menuRef = useRef<HTMLDivElement>(null);
    const backgroundRef = useRef<HTMLDivElement>(null);
    const { openModal } = useSearchModal(); // Use context to open modal

    const getHeaderClass = () => {
        if (pathname === '/login') return 'header _login';
        if (pathname === '/dashboard') return 'header _dashboard';
        return 'header';
    };

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

    const handleMenuClick = useCallback(() => {
        setIsMenuOpen(false); // Always close menu on click, don't toggle
    }, []);

    const menuItemElements = useMemo(
        () =>
            menuItems.map((item) => (
                <AnimatedWrapper
                    as="li"
                    key={item.href}
                    // Only keep NON-CONFLICTING animations here
                    hover={{ from: { scale: 1 }, to: { scale: 1.1 } }}
                    click={{ from: { scale: 1 }, to: { scale: 0.9 } }}
                >
                    <Link
                        href={item.href}
                        className={`${pathname === item.href ? 'active' : ''}`}
                        onClick={handleMenuClick}
                    >
                        {item.label}
                    </Link>
                </AnimatedWrapper>
            )),
        [pathname, handleMenuClick]
    );

    // Updated menu animation config
    const menuAnimation = useMemo(
        () => ({
            from: {
                opacity: 0,
                // Animate container properties only
                transform: 'translateY(-20px)',
            },
            to: {
                opacity: isMenuOpen ? 1 : 0,
                transform: isMenuOpen ? 'translateY(0)' : 'translateY(-20px)',
            },
            config: smoothConfig,
            trail: {
                items: menuItemElements,
                from: { opacity: 0, transform: 'translateX(-50px)' },
                to: {
                    opacity: isMenuOpen ? 1 : 0,
                    transform: isMenuOpen ? 'translateX(0)' : 'translateX(-50px)',
                },
                // Add unique keys to prevent conflict with child animations
                keys: ['menu-trail'],
            },
        }),
        [isMenuOpen, menuItemElements]
    );

    // Show/hide overlay with correct close handler
    useEffect(() => {
        if (isMenuOpen) {
            showOverlay({
                zIndex: 99,
                blurClass: '',
                onClick: () => setIsMenuOpen(false), // Always use the same handler
            });
        } else {
            hideOverlay();
        }
        return () => hideOverlay();
    }, [isMenuOpen, showOverlay, hideOverlay, setIsMenuOpen]);

    // Escape key and click outside
    useEffect(() => {
        if (!isMenuOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsMenuOpen(false);
        };
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node))
                setIsMenuOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <header className={getHeaderClass()}>
            <nav className="header__nav">
                <div className="header__nav-left">
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
                            config={{
                                ...smoothConfig,
                                duration: staggerConfig.backgroundDuration,
                            }}
                        >
                            {/* Menu items */}
                            <AnimatedWrapper
                                as="ul"
                                className="__ul"
                                {...menuAnimation}
                                // Add this to prevent child animation conflicts
                                animationStyle={{
                                    // Explicitly specify which properties to animate
                                    opacity: menuAnimation.to.opacity,
                                    transform: menuAnimation.to.transform,
                                }}
                            >
                                {menuItemElements}
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
                        onClick={() => openModal()}
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
        </header>
    );
}
