'use client';

import AnimatedWrapper from '@/components/ui/AnimatedWrapper.client';

interface OverlayProps {
    isVisible: boolean;
    onClick?: () => void;
    className?: string;
    zIndex?: number;
}

export default function Overlay({ isVisible, onClick, className = '', zIndex = 10 }: OverlayProps) {
    return (
        <AnimatedWrapper
            as="div"
            style={{ zIndex }}
            onClick={onClick}
            className={`__overlay ${className}`}
            from={{ opacity: 0, display: 'none' }}
            to={{
                opacity: isVisible ? 1 : 0,
                display: isVisible ? 'block' : 'none',
            }}
            config={{ mass: 1, tension: 210, friction: 20 }} // Optimized spring configuration
            hover={isVisible ? { to: { transform: 'scale(1.05)' } } : undefined} // Subtle hover effect
            click={isVisible ? { to: { transform: 'scale(0.95)' } } : undefined} // Subtle click effect
        />
    );
}
