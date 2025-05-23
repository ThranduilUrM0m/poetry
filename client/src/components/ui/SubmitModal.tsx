'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { useOverlay } from '@/context/OverlayContext';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper.client';

// Define the smooth beautiful configuration like in the Footer component
const smoothConfig = { mass: 1, tension: 170, friction: 26 };

interface SubmitModalProps {
    isSubmitOpen: boolean;
    onSubmitClose: () => void;
    header: string;
    message: string;
    isSuccess: boolean;
}

export default function SubmitModal({
    isSubmitOpen,
    onSubmitClose,
    header,
    message,
    isSuccess,
}: Readonly<SubmitModalProps>) {
    const dispatch = useDispatch<AppDispatch>();
    const { showOverlay, hideOverlay } = useOverlay();
    const modalRef = useRef<HTMLDivElement>(null);

    // Show/hide overlay with correct close handler
    useEffect(() => {
        if (isSubmitOpen) {
            showOverlay({
                zIndex: 99,
                blurClass: '',
                onClick: onSubmitClose, // Always use the same handler
            });
        } else {
            hideOverlay();
        }
        return () => hideOverlay();
    }, [isSubmitOpen, showOverlay, hideOverlay, onSubmitClose]);

    // Escape key and click outside
    useEffect(() => {
        if (!isSubmitOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onSubmitClose();
        };
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) onSubmitClose();
        };
        document.addEventListener('keydown', handleEscape);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSubmitOpen, onSubmitClose, dispatch]);

    if (!isSubmitOpen) return null;

    // Function to check if a string contains Arabic characters
    const containsArabic = (text: string) => {
        const arabicRegex = /[\u0600-\u06FF]/;
        return arabicRegex.test(text);
    };

    return createPortal(
        <AnimatedWrapper
            className="_modal__submit"
            from={{ opacity: 0, transform: 'translateY(-50px) translateX(-50%)' }}
            to={{ opacity: 1, transform: 'translateY(0) translateX(-50%)' }}
            config={smoothConfig}
            ref={modalRef}
        >
            {/* Header */}
            <div className="_header">
                <h2 className="_headerTitle">
                    {isSuccess ? header : 'There seems to be a problem!'}
                </h2>
                <AnimatedWrapper
                    as="button"
                    onClick={onSubmitClose}
                    aria-label="Close Submit"
                    className="__submitClose"
                    hover={{ from: { scale: 1 }, to: { scale: 1.1 } }}
                    click={{ from: { scale: 1 }, to: { scale: 0.9 } }}
                    config={smoothConfig}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                        <g>
                            <line className="one" x1="29.5" y1="49.5" x2="70.5" y2="49.5"></line>
                            <line className="two" x1="29.5" y1="50.5" x2="70.5" y2="50.5"></line>
                        </g>
                    </svg>
                </AnimatedWrapper>
            </div>

            {/* Body */}
            <div className="_body">
                <h2 lang={containsArabic(message) ? 'ar' : 'en'}>{message}</h2>
            </div>

            {/* Footer */}
            <div className="_footer">
                <form className="_form">
                    <div className="_row">
                        <Link
                            href=""
                            className="_button closeButton"
                            id="_buttonSubmitClose"
                            onClick={onSubmitClose}
                        >
                            {/* The sequential effect is still a mystery and the background effect is not reversing with ease */}
                            <AnimatedWrapper
                                as="span"
                                className="buttonBackground"
                                hover={{
                                    from: { clipPath: 'inset(0 100% 0 0)' },
                                    to: { clipPath: 'inset(0 0 0 0)' },
                                }}
                                config={{ mass: 1, tension: 170, friction: 26 }}
                                parentHoverSelector="#_buttonSubmitClose"
                            ></AnimatedWrapper>
                            <div className="buttonBorders">
                                {/* Top border: animate width */}
                                <AnimatedWrapper
                                    as="div"
                                    className="borderTop"
                                    hover={{
                                        from: { width: '0%' },
                                        to: { width: '100%' },
                                        delay: 0,
                                    }}
                                    parentHoverSelector="#_buttonSubmitClose" // <-- Updated parent hover selector
                                    onRest={() => {
                                        // Trigger the next animation after this one completes
                                        document
                                            .querySelector('.borderRight')
                                            ?.dispatchEvent(new Event('startAnimation'));
                                    }}
                                />
                                {/* Right border: animate height */}
                                <AnimatedWrapper
                                    as="div"
                                    className="borderRight"
                                    hover={{
                                        from: { height: '0%' },
                                        to: { height: '100%' },
                                        delay: 0, // Start immediately after the previous animation
                                    }}
                                    parentHoverSelector="#_buttonSubmitClose" // <-- Updated parent hover selector
                                    onRest={() => {
                                        // Trigger the next animation after this one completes
                                        document
                                            .querySelector('.borderBottom')
                                            ?.dispatchEvent(new Event('startAnimation'));
                                    }}
                                />
                                {/* Bottom border: animate width */}
                                <AnimatedWrapper
                                    as="div"
                                    className="borderBottom"
                                    hover={{
                                        from: { width: '0%' },
                                        to: { width: '100%' },
                                        delay: 0, // Start immediately after the previous animation
                                    }}
                                    parentHoverSelector="#_buttonSubmitClose" // <-- Updated parent hover selector
                                    onRest={() => {
                                        // Trigger the next animation after this one completes
                                        document
                                            .querySelector('.borderLeft')
                                            ?.dispatchEvent(new Event('startAnimation'));
                                    }}
                                />
                                {/* Left border: animate height */}
                                <AnimatedWrapper
                                    as="div"
                                    className="borderLeft"
                                    hover={{
                                        from: { height: '0%' },
                                        to: { height: '100%' },
                                        delay: 0, // Start immediately after the previous animation
                                    }}
                                    parentHoverSelector="#_buttonSubmitClose" // <-- Updated parent hover selector
                                />
                            </div>
                            <AnimatedWrapper
                                as="span"
                                className="buttonContent"
                                hover={{
                                    from: {
                                        color: 'rgb(var(--text)/1)',
                                    },
                                    to: {
                                        color: 'rgb(var(--white)/1)',
                                    },
                                }}
                                config={{
                                    mass: 1,
                                    tension: 170,
                                    friction: 26,
                                }}
                                parentHoverSelector="#_buttonSubmitClose"
                            >
                                Close<b className="__dot">.</b>
                            </AnimatedWrapper>
                        </Link>
                    </div>
                </form>
            </div>
        </AnimatedWrapper>,
        document.body
    );
}
