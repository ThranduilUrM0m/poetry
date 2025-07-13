'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { Copyright, Heart, ChevronUp } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { config } from '@react-spring/web';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper.client';
import Newsletter from '@/components/ui/Newsletter';
import { useLoading } from '@/context/LoadingContext';
import { useMedia } from 'react-use';

const AboutItems = [
    { label: 'À propos de moi', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
];

const LegalItems = [
    { label: 'Mentions Légales', href: '' },
    { label: 'Newsroom', href: '' },
];

const SocialItems = [
    { label: 'Instagram', href: 'https://www.instagram.com/boutaleblcoder', icon: FaInstagram },
    { label: 'Facebook', href: 'https://fb.me/boutaleblcoder', icon: FaFacebookF },
    { label: 'X', href: 'https://www.behance.net/boutaleblcoder', icon: FaXTwitter }, // Using X (Twitter) icon for Behance
];

export default function Footer() {
    const { isLoaded } = useLoading();
    const pathname = usePathname();
    const isSm = useMedia('(min-width: 640px)');

    // Define the smooth beautiful configuration
    const smoothConfig = { mass: 1, tension: 170, friction: 26 };

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
                        Inscrivez-vous à notre <span className="__lastWord">Newsletter</span>
                        <br />
                        Et soyez le premier à recevoir des mises à jour.
                    </h2>
                    <Newsletter />
                </div>
                <div className="footer__container-right">
                    <h2>Qasidaty.</h2>
                    <div className="footer__container-right-links">
                        <div>
                            <h3>
                                Trouvez-moi
                            </h3>
                            <AnimatedWrapper
                                as="ul"
                                className="__ul-Social"
                                from={{ opacity: 0 }}
                                to={{ opacity: isLoaded ? 1 : 0 }}
                                config={smoothConfig}
                            >
                                {SocialItems.map((item) => (
                                    <AnimatedWrapper
                                        as="li"
                                        id={`_iconSocial${item.label}`}
                                        key={item.href}
                                        hover={{
                                            from: { scale: 1 },
                                            to: { scale: 1.1 },
                                        }}
                                        click={{
                                            from: { scale: 1 },
                                            to: { scale: 0.9 },
                                        }}
                                        config={config.wobbly}
                                    >
                                        <Link
                                            href={item.href}
                                            className={`${pathname === item.href ? 'active' : ''}`}
                                        >
                                            <AnimatedWrapper
                                                as="span"
                                                className="iconBackground"
                                                hover={{
                                                    from: { clipPath: 'inset(0 100% 0 0)' },
                                                    to: { clipPath: 'inset(0 0 0 0)' },
                                                }}
                                                config={config.wobbly}
                                                parentHoverSelector={`#_iconSocial${item.label}`}
                                            ></AnimatedWrapper>
                                            <item.icon />
                                        </Link>
                                    </AnimatedWrapper>
                                ))}
                            </AnimatedWrapper>
                        </div>

                        <div>
                            <h3>
                                À propos
                            </h3>
                            <AnimatedWrapper
                                as="ul"
                                className="__ul-About"
                                from={{ opacity: 0 }}
                                to={{ opacity: isLoaded ? 1 : 0 }}
                                config={smoothConfig}
                            >
                                {AboutItems.map((item) => (
                                    <AnimatedWrapper
                                        as="li"
                                        key={item.href}
                                        hover={{
                                            from: { transform: 'translateX(0vh)' },
                                            to: { transform: 'translateX(0.5vh)' },
                                        }}
                                        click={{
                                            from: { scale: 1 },
                                            to: { scale: 0.9 },
                                        }}
                                        config={config.wobbly}
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
                            <h3>
                                Mentions Légales
                            </h3>
                            <AnimatedWrapper
                                as="ul"
                                className="__ul-Legal"
                                from={{ opacity: 0 }}
                                to={{ opacity: isLoaded ? 1 : 0 }}
                                config={smoothConfig}
                            >
                                {LegalItems.map((item) => (
                                    <AnimatedWrapper
                                        as="li"
                                        key={item.label}
                                        hover={{
                                            from: { transform: 'translateX(0vh)' },
                                            to: { transform: 'translateX(0.5vh)' },
                                        }}
                                        click={{
                                            from: { scale: 1 },
                                            to: { scale: 0.9 },
                                        }}
                                        config={config.wobbly}
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
                        from={{ opacity: 0 }}
                        to={{ opacity: isLoaded ? 1 : 0 }}
                        config={smoothConfig}
                    >
                        <li>
                            Copyrights <Copyright size={16} />
                            <span>{format(new Date(), 'yyyy')}</span> {isSm && '-'} With <Heart size={16} />{' '}
                            from boutaleb.
                        </li>
                    </AnimatedWrapper>
                </div>
                <div className="footer__nav-right">
                    <AnimatedWrapper
                        as="ul"
                        className="__ul"
                        from={{ opacity: 0 }}
                        to={{ opacity: isLoaded ? 1 : 0 }}
                        config={smoothConfig}
                    >
                        <li>
                            <Link
                                href="#"
                                id='_backToTop'
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            >
                                <AnimatedWrapper
                                    as="span" // Use a span to wrap the text and arrow
                                    hover={{
                                        from: { transform: 'translateY(0vh)' },
                                        to: { transform: 'translateY(-0.5vh)' },
                                    }}
                                    config={config.wobbly}
                                    parentHoverSelector="#_backToTop"
                                >
                                    Retour en haut.
                                    <AnimatedWrapper
                                        as={ChevronUp}
                                        hover={{
                                            from: { transform: 'translateY(0vh)' },
                                            to: { transform: 'translateY(-0.75vh)' },
                                        }}
                                        config={config.wobbly}
                                        parentHoverSelector="#_backToTop"
                                    />
                                </AnimatedWrapper>
                            </Link>
                        </li>
                    </AnimatedWrapper>
                </div>
            </nav>
        </footer>
    );
}
