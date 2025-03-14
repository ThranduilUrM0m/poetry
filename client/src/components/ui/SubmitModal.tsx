'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import Overlay from '@/components/ui/Overlay';
import AnimatedWrapper from '@/components/ui/AnimatedWrapper';

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
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Event listeners for Escape key and click outside
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isSubmitOpen) {
                onSubmitClose();
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node) && // Click is outside the modal
                overlayRef.current &&
                overlayRef.current.contains(event.target as Node) // Click is on the overlay
            ) {
                onSubmitClose();
            }
        };

        if (isSubmitOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSubmitOpen, onSubmitClose, dispatch]);

    if (!isSubmitOpen) return null;

    return createPortal(
        <>
            <Overlay isVisible={isSubmitOpen} onClick={onSubmitClose} zIndex={20} />
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
                                <line
                                    className="one"
                                    x1="29.5"
                                    y1="49.5"
                                    x2="70.5"
                                    y2="49.5"
                                ></line>
                                <line
                                    className="two"
                                    x1="29.5"
                                    y1="50.5"
                                    x2="70.5"
                                    y2="50.5"
                                ></line>
                            </g>
                        </svg>
                    </AnimatedWrapper>
                </div>

                {/* Body */}
                <div className="_body">
                    <h2>{message}</h2>
                </div>

                {/* Footer */}
                <div className="_footer">
                    <form className="_form">
                        <Link
                            href=""
                            className="_button closeButton"
                            id="_buttonClose"
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
                                parentHoverSelector="#_buttonClose"
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
                                    parentHoverSelector="#_buttonClose" // <-- Updated parent hover selector
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
                                    parentHoverSelector="#_buttonClose" // <-- Updated parent hover selector
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
                                    parentHoverSelector="#_buttonClose" // <-- Updated parent hover selector
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
                                    parentHoverSelector="#_buttonClose" // <-- Updated parent hover selector
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
                                parentHoverSelector="#_buttonClose"
                            >
                                Close<b className="pink_dot">.</b>
                            </AnimatedWrapper>
                        </Link>
                    </form>
                </div>
            </AnimatedWrapper>
        </>,
        document.body
    );
}
