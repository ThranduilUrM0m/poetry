'use client';

import {
    motion,
    HTMLMotionProps,
    Variants,
    TargetAndTransition,
    VariantLabels,
    Transition,
} from 'framer-motion';
import React, { forwardRef, ReactElement, useRef } from 'react';

// Define a type for valid HTML element tag names
type HTMLElementTag = keyof HTMLElementTagNameMap;

// Define a type for the 'as' prop, allowing only valid HTML element tag names
type AsProp<T extends HTMLElementTag> = {
    as?: T;
};

// Define animation props
type AnimationProps = {
    variants?: Variants;
    initial?: boolean | TargetAndTransition | VariantLabels;
    animate?: boolean | TargetAndTransition | VariantLabels;
    exit?: TargetAndTransition | VariantLabels;
    whileHover?: TargetAndTransition | VariantLabels;
    whileTap?: TargetAndTransition | VariantLabels;
    whileFocus?: TargetAndTransition | VariantLabels;
    whileInView?: TargetAndTransition | VariantLabels;
    transition?: Transition;
};

// Combine the 'as' prop with the props of the chosen element/component
type Props<T extends HTMLElementTag> = AsProp<T> &
    HTMLMotionProps<T> &
    AnimationProps & {
        variant?: 'primary' | 'secondary';
    };

// Create the AnimatedWrapper component
const AnimatedWrapper = <T extends HTMLElementTag = 'div'>(
    {
        as,
        children,
        variants,
        initial,
        animate,
        exit,
        whileHover,
        whileTap,
        whileFocus,
        whileInView,
        transition,
        ...rest
    }: Props<T>,
    ref: React.Ref<Element>
): ReactElement => {
    // Determine the component to render
    const Component = as || 'div';

    // Create a motion component for the dynamically determined element
    const MotionComponent = motion[Component] as React.ElementType;

    // Ref to track the animated element
    const elementRef = useRef<HTMLElement>(null);

    // Ref to store the latest transform value
    const latestTransform = useRef<string>('');

    // Function to handle updates on every frame
    const handleUpdate = (latest: { [key: string]: string | number }) => {
        if (elementRef.current) {
            // Construct the transform string from the latest values
            const transformString = Object.entries(latest)
                .filter(
                    ([key]) =>
                        key.startsWith('scale') ||
                        key.startsWith('rotate') ||
                        key.startsWith('translate') ||
                        key === 'x' ||
                        key === 'y' ||
                        key === 'z'
                )
                .map(([key, value]) => {
                    if (typeof value === 'number') {
                        // Append units for translation and rotation
                        if (
                            key.startsWith('translate') ||
                            key === 'x' ||
                            key === 'y' ||
                            key === 'z'
                        ) {
                            return `${key}(${value}px)`;
                        } else if (key.startsWith('rotate')) {
                            return `${key}(${value}deg)`;
                        }
                    }
                    return `${key}(${value})`;
                })
                .join(' ');

            // Update the latest transform value
            latestTransform.current = transformString;
        }
    };

    // Function to handle animation completion
    const handleAnimationComplete = () => {
        if (elementRef.current) {
            // Apply the latest transform value to the element's style
            elementRef.current.style.transform = latestTransform.current || '';
        }
    };

    // Render the motion-wrapped component with forwarded ref
    return (
        <MotionComponent
            ref={(node: HTMLElement) => {
                // Forward the ref to both the elementRef and the forwarded ref
                elementRef.current = node;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    (ref as React.MutableRefObject<HTMLElement>).current = node;
                }
            }}
            variants={variants}
            initial={initial}
            animate={animate}
            exit={exit}
            whileHover={whileHover}
            whileTap={whileTap}
            whileFocus={whileFocus}
            whileInView={whileInView}
            transition={transition}
            onUpdate={handleUpdate}
            onAnimationComplete={handleAnimationComplete}
            {...(rest as HTMLMotionProps<T>)}
        >
            {children}
        </MotionComponent>
    );
};

// Export the component using forwardRef
export default forwardRef(AnimatedWrapper);
