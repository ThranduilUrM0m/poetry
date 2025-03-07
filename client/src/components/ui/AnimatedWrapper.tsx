'use client';

import React, { forwardRef, ReactElement, useRef } from 'react';
import {
    motion,
    HTMLMotionProps,
    Variants,
    TargetAndTransition,
    VariantLabels,
    Transition,
} from 'framer-motion';

// Define a type for valid HTML element tag names
type HTMLElementTag = keyof HTMLElementTagNameMap;

type AsProp<T extends HTMLElementTag> = {
    as?: T | React.ElementType;
};

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

type Props<T extends HTMLElementTag> = AsProp<T> &
    HTMLMotionProps<T> &
    AnimationProps & {
        variant?: 'primary' | 'secondary';
        htmlFor?: string;
        type?: T extends 'button' ? 'button' | 'submit' | 'reset' : never;
    };

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
        htmlFor,
        type,
        ...rest
    }: Props<T>,
    ref: React.Ref<Element>
): ReactElement => {
    const Component = as || 'div';
    const MotionComponent = motion[Component as keyof typeof motion] as React.ElementType;
    const elementRef = useRef<HTMLElement>(null);

    return (
        <MotionComponent
            ref={(node: HTMLElement) => {
                elementRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) (ref as React.RefObject<HTMLElement>).current = node;
            }}
            onAnimationComplete={() => {
                if (elementRef.current) {
                    elementRef.current.style.transform = '';
                }
            }}
            {...{
                variants,
                initial,
                animate,
                exit,
                whileHover,
                whileTap,
                whileFocus,
                whileInView,
                transition,
                htmlFor,
                type,
                ...(rest as HTMLMotionProps<T>),
            }}
        >
            {children}
        </MotionComponent>
    );
};

export default forwardRef(AnimatedWrapper);
