'use client';

import { motion } from 'framer-motion';

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

/* It needs to be on AnimatedWrapper */
export default function Overlay({ isVisible, onClick, className = '', zIndex = 10 }: OverlayProps) {
    return (
        <motion.div
            className={`__overlay ${className}`}
            style={{ zIndex }} // Apply zIndex here
            variants={overlayVariants}
            initial="closed"
            animate={isVisible ? 'open' : 'closed'}
            transition={{ duration: 0.2 }}
            onClick={onClick}
        />
    );
}
