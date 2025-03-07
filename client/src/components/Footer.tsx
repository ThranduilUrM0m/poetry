'use client';

import Link from 'next/link';
import Newsletter from '@/components/ui/Newsletter';
import { useLoading } from '@/context/LoadingContext';
import { format } from 'date-fns';
import { Copyright, Heart, ChevronUp, Instagram, Facebook, Twitter as XIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import AnimatedWrapper from './ui/AnimatedWrapper';

const AboutItems = [
    { label: 'About me', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
];

const LegalItems = [
    { label: 'Legal Notice', href: '' },
    { label: 'Newsroom', href: '' },
];

const SocialItems = [
    { label: 'Instagram', href: 'https://www.instagram.com/boutaleblcoder', icon: Instagram },
    { label: 'Facebook', href: 'https://fb.me/boutaleblcoder', icon: Facebook },
    { label: 'Behance', href: 'https://www.behance.net/boutaleblcoder', icon: XIcon }, // Using X (Twitter) icon for Behance
];

/* const navVariants = {
    open: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
            when: 'afterChildren',
        },
    },
    closed: {
        transition: {
            staggerChildren: 0.05,
            staggerDirection: -1,
            when: 'afterChildren',
        },
    },
};

const itemVariants = {
    open: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: [0.6, 0.05, -0.01, 0.9],
        },
    },
    closed: {
        y: 50,
        opacity: 0,
        transition: {
            duration: 0.4,
            ease: [0.6, 0.05, -0.01, 0.9],
        },
    },
}; */

export default function Footer() {
    const { isLoaded } = useLoading();
    const pathname = usePathname();

    const getFooterClass = () => {
        if (pathname === '/login') return 'footer _login';
        if (pathname === '/dashboard') return 'footer _dashboard';
        return 'footer';
    };

    return (
        <footer className={getFooterClass()}>
            <div className="footer__container">
                <div className="footer__container-left">
                    <h2>
                        Sign up for our <span className="__lastWord">Newsletter</span>
                        <br />
                        And be the first to receive updates.
                    </h2>
                    <Newsletter />
                </div>
                <div className="footer__container-right">
                    <h2>Qasida</h2>
                    <div className="footer__container-right-links">
                        <div>
                        <AnimatedWrapper
                            as="h3"
                            key="__titleSocial"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            Find Me
                        </AnimatedWrapper>
                        <AnimatedWrapper
                            as="ul"
                            className="__ul-Social"
                            initial="initial"
                            animate={isLoaded ? 'animate' : 'initial'}
                        >
                            {SocialItems.map((item) => (
                                <AnimatedWrapper
                                    as="li"
                                    key={item.href}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Link
                                        href={item.href}
                                        className={`${pathname === item.href ? 'active' : ''}`}
                                    >
                                        {/* Render icon as a JSX element */}
                                        <item.icon />
                                    </Link>
                                </AnimatedWrapper>
                            ))}
                        </AnimatedWrapper>
                        </div>

                        <div>
                        <AnimatedWrapper
                            as="h3"
                            key="__titleAbout"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            About
                        </AnimatedWrapper>
                        <AnimatedWrapper
                            as="ul"
                            className="__ul-About"
                            initial="initial"
                            animate={isLoaded ? 'animate' : 'initial'}
                        >
                            {AboutItems.map((item) => (
                                <AnimatedWrapper
                                    as="li"
                                    key={item.href}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Link
                                        href={item.href}
                                        className={`${pathname === item.href ? 'active' : ''}`}
                                    >
                                        {item.label}
                                    </Link>
                                </AnimatedWrapper>
                            ))}
                        </AnimatedWrapper>
                        </div>

                        <div>
                        <AnimatedWrapper
                            as="h3"
                            key="__titleLegal"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            Legal
                        </AnimatedWrapper>
                        <AnimatedWrapper
                            as="ul"
                            className="__ul-Legal"
                            initial="initial"
                            animate={isLoaded ? 'animate' : 'initial'}
                        >
                            {LegalItems.map((item) => (
                                <AnimatedWrapper
                                    as="li"
                                    key={item.href}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Link
                                        href={item.href}
                                        className={`${pathname === item.href ? 'active' : ''}`}
                                    >
                                        {item.label}
                                    </Link>
                                </AnimatedWrapper>
                            ))}
                        </AnimatedWrapper>
                        </div>
                    </div>
                </div>
            </div>
            <nav className="footer__nav">
                <div className="footer__nav-left">
                    <AnimatedWrapper
                        as="ul"
                        className="__ul"
                        initial="initial"
                        animate={isLoaded ? 'animate' : 'initial'}
                    >
                        {/* Copyright Text instead of Link */}
                        <AnimatedWrapper
                            as="li"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            Copyrights
                            <Copyright size={16} />
                            <span>{format(new Date(), 'yyyy')}</span> - With <Heart size={16} />{' '}
                            from boutaleb.
                        </AnimatedWrapper>
                    </AnimatedWrapper>
                </div>
                <div className="footer__nav-right">
                    <AnimatedWrapper
                        as="ul"
                        className="__ul"
                        initial="initial"
                        animate={isLoaded ? 'animate' : 'initial'}
                    >
                        <AnimatedWrapper
                            as="li"
                            key="/"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Link
                                href="#"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            >
                                Back to the top
                                <ChevronUp size={16} />
                            </Link>
                        </AnimatedWrapper>
                    </AnimatedWrapper>
                </div>
            </nav>
        </footer>
    );
}
