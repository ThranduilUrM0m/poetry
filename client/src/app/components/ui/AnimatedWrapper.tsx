'use client';

import {
    motion,
    HTMLMotionProps,
    Variants,
    TargetAndTransition,
    VariantLabels,
    Transition,
} from 'framer-motion'; // Import required types
import React, { forwardRef, ReactElement } from 'react';

// Define a type for valid HTML element tag names
type HTMLElementTag = keyof HTMLElementTagNameMap;

// Define a type for the 'as' prop, allowing only valid HTML element tag names
type AsProp<T extends HTMLElementTag> = {
    as?: T;
};

// Define animation props
type AnimationProps = {
    variants?: Variants; // Use Variants type
    initial?: boolean | TargetAndTransition | VariantLabels; // Use Framer Motion types
    animate?: boolean | TargetAndTransition | VariantLabels; // Use Framer Motion types
    exit?: TargetAndTransition | VariantLabels; // Use Framer Motion types
    whileHover?: TargetAndTransition | VariantLabels; // Use Framer Motion types
    whileTap?: TargetAndTransition | VariantLabels; // Use Framer Motion types
    whileFocus?: TargetAndTransition | VariantLabels; // Use Framer Motion types
    whileInView?: TargetAndTransition | VariantLabels; // Use Framer Motion types
    transition?: Transition; // Use Transition type
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

    // Render the motion-wrapped component with forwarded ref
    return (
        <MotionComponent
            ref={ref as React.Ref<HTMLDivElement>} // Type assertion for the ref
            variants={variants} // Pass variants
            initial={initial} // Pass initial
            animate={animate} // Pass animate
            exit={exit} // Pass exit
            whileHover={whileHover} // Pass whileHover
            whileTap={whileTap} // Pass whileTap
            whileFocus={whileFocus} // Pass whileFocus
            whileInView={whileInView} // Pass whileInView
            transition={transition} // Pass transition
            {...(rest as HTMLMotionProps<T>)} // Type assertion for the rest of the props
        >
            {children}
        </MotionComponent>
    );
};

// Export the component using forwardRef
export default forwardRef(AnimatedWrapper);
