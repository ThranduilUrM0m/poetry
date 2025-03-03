'use client';

import AnimatedWrapper from '@/components/ui/AnimatedWrapper';

const overlayVariants = {
    open: {
        opacity: 1,
        display: 'block',
    },
    closed: {
        opacity: 0,
        transitionEnd: {
            display: 'none',
        },
    },
};

interface OverlayProps {
    isVisible: boolean;
    onClick?: () => void;
    className?: string;
    zIndex?: number; // Add zIndex prop
}

export default function Overlay({ isVisible, onClick, className = '', zIndex = 10 }: OverlayProps) {
    return (
        <AnimatedWrapper
            as="div"
            style={{ zIndex }} // Apply zIndex here
            onClick={onClick}
            className={`__overlay ${className}`}
            variants={overlayVariants}
            initial="closed"
            animate={isVisible ? 'open' : 'closed'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.5 }}
        ></AnimatedWrapper>
    );
}
