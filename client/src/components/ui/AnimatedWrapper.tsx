'use client';
import React, { forwardRef, ReactElement, useRef, useState, useEffect, useMemo } from 'react';
import {
    animated,
    useSpring,
    useSpringRef,
    SpringConfig,
    SpringValue,
    useTrail,
} from '@react-spring/web';
import type { CSSProperties } from 'react';
import { useGesture } from '@use-gesture/react';
import { useInView } from 'react-intersection-observer';
import { useMergedRef } from '@/hooks/useMergedRef';

type HTMLElementTag = keyof HTMLElementTagNameMap;
type AsProp<T extends HTMLElementTag> = { as?: T | React.ElementType };

type AnimationProps = {
    from?: React.CSSProperties | { [key: string]: SpringValue<string | number> };
    to?: React.CSSProperties | { [key: string]: SpringValue<string | number> };
    config?: SpringConfig;
    delay?: number;
    onRest?: () => void;
    hover?: {
        delay?: number;
        from?: React.CSSProperties;
        to?: React.CSSProperties;
    };
    focus?: {
        from?: React.CSSProperties;
        to?: React.CSSProperties;
    };
    click?: {
        from?: React.CSSProperties;
        to?: React.CSSProperties;
    };
    scroll?: {
        from?: React.CSSProperties;
        to?: React.CSSProperties;
    };
    mount?: {
        from?: React.CSSProperties;
        to?: React.CSSProperties;
    };
    unmount?: {
        from?: React.CSSProperties;
        to?: React.CSSProperties;
    };
    drag?: {
        from?: React.CSSProperties;
        to?: React.CSSProperties;
    };
    resize?: {
        from?: React.CSSProperties;
        to?: React.CSSProperties;
    };
    keyboard?: {
        from?: React.CSSProperties;
        to?: React.CSSProperties;
        key?: string;
    };
    touch?: {
        from?: React.CSSProperties;
        to?: React.CSSProperties;
    };
    custom?: {
        from?: React.CSSProperties;
        to?: React.CSSProperties;
        trigger?: () => boolean;
    };
    trail?: {
        items: React.ReactNode[];
        from: React.CSSProperties;
        to: React.CSSProperties;
        config?: SpringConfig;
        delay?: number;
        keys?: string[]; // Add this line
    };
};

type AnimationStyle =
    | React.CSSProperties
    | {
          [key: string]:
              | string
              | number
              | SpringValue<string | number>
              | SpringValue<string>
              | SpringValue<number>;
      };

type Props<T extends HTMLElementTag> = AsProp<T> &
    React.HTMLAttributes<HTMLElement> &
    AnimationProps & {
        variant?: 'primary' | 'secondary';
        htmlFor?: string;
        type?: T extends 'button' ? 'button' | 'submit' | 'reset' : never;
        animationStyle?: AnimationStyle;
        parentHoverSelector?: string;
        // SVG line specific props
        x1?: string | number;
        y1?: string | number;
        x2?: string | number;
        y2?: string | number;
        // New prop to pass in an external spring ref for chaining.
        // Instead of using any, we use the return type of useSpringRef.
        // chainRef and sequencing removed; handle externally if needed
    };

// Define the shape of styles produced by useSpring()
type SpringStyles = SpringValue<string> | SpringValue<number> | string | number;

function normalizeKeys(styles: Record<string, SpringStyles>): CSSProperties {
    // Looser scratchpad
    const loose: Record<string, string | number> = {};

    for (const rawKey in styles) {
        const val = styles[rawKey];
        const camelKey = rawKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        loose[camelKey] = val as unknown as string | number;
    }

    // Final, single assertion
    return loose as CSSProperties;
}

const AnimatedWrapper = <T extends HTMLElementTag = 'div'>(
    {
        as = 'div',
        children,
        from = {},
        to = {},
        config,
        delay,
        onRest,
        hover,
        focus,
        click,
        scroll,
        mount,
        unmount,
        drag,
        resize,
        keyboard,
        touch,
        custom,
        trail,
        htmlFor,
        type,
        animationStyle,
        parentHoverSelector,
        ...rest
    }: Props<T>,
    ref: React.Ref<Element>
): ReactElement => {
    const elementRef = useRef<HTMLElement>(null);
    const [isClicked, setIsClicked] = useState(false);
    const { ref: inViewRef, inView } = useInView({ triggerOnce: true });

    // Merge three refs:
    // 1) elementRef (internal)
    // 2) inViewRef (from useInView)
    // 3) forwarded ref (for animations)
    const mergedRef = useMergedRef<HTMLElement>(
        elementRef,
        inViewRef,
        // We cast the `ref` so that TS understands it may be a callback or an object ref
        ref as React.RefCallback<HTMLElement> | React.MutableRefObject<HTMLElement | null>
    );

    // Always create an internal spring ref for this wrapper
    const springRef = useSpringRef();

    // Create the spring bound to its own ref (no external chaining here)
    const [springs, api] = useSpring(() => ({
        ref: springRef,
        ...(hover?.from || {}),
        ...from,
        config,
        delay,
        onRest: () => {
            if (onRest) onRest();
        },
    }));

    // Handle trail animations
    const trailConfig = useMemo(
        () => ({
            from: trail?.from || {},
            to: trail?.to || {},
            config: trail?.config,
            delay: trail?.delay,
        }),
        [trail?.from, trail?.to, trail?.config, trail?.delay]
    );

    const trailSprings = useTrail(trail ? trail.items.length : 0, {
        ...trailConfig,
        // Use optional chaining and provide a default
        key: trail?.keys?.[0] || 'default-trail',
        from: {
            ...trailConfig.from,
            scale: trailConfig.from?.scale || 1,
        },
        to: {
            ...trailConfig.to,
            scale: trailConfig.to?.scale || 1,
        },
    });

    // Set initial state on mount.
    useEffect(() => {
        const initialState = { ...(hover?.from || {}), ...from };
        if (Object.keys(initialState).length > 0) {
            api.start({ ...initialState, config, immediate: true });
        }
    }, []);

    // Mount only: apply 'to' animations after a short delay.
    useEffect(() => {
        if (to && Object.keys(to).length > 0) {
            const timer = setTimeout(() => {
                api.start({ ...to, config });
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [to, config, api]);

    useEffect(() => {
        if (animationStyle) {
            api.start({ ...animationStyle });
        }
    }, [animationStyle, api]);

    // Handle hover animations with delay support.
    const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const bindHover = useGesture({
        onHover: ({ hovering }) => {
            if (hover) {
                if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                const hoverDelay = hover.delay || 0;
                hoverTimeout.current = setTimeout(() => {
                    api.start({ ...(hovering ? hover.to : hover.from), config, immediate: false });
                }, hoverDelay);
            }
        },
    });

    useEffect(() => {
        return () => {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        };
    }, []);

    // Handle parent hover animations.
    const handleParentHover = React.useCallback(
        (hovering: boolean) => {
            if (hover) {
                if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                const hoverDelay = hover.delay || 0;
                hoverTimeout.current = setTimeout(() => {
                    api.start({
                        ...(hovering ? hover.to : hover.from),
                        config,
                        immediate: false,
                    });
                }, hoverDelay);
            }
        },
        [hover, api, config]
    );

    useEffect(() => {
        if (parentHoverSelector) {
            const parentElement = document.querySelector(parentHoverSelector);
            if (parentElement) {
                // Direct function references
                const handleMouseEnter = () => handleParentHover(true);
                const handleMouseLeave = () => handleParentHover(false);

                parentElement.addEventListener('mouseenter', handleMouseEnter);
                parentElement.addEventListener('mouseleave', handleMouseLeave);

                return () => {
                    parentElement.removeEventListener('mouseenter', handleMouseEnter);
                    parentElement.removeEventListener('mouseleave', handleMouseLeave);
                };
            }
        }
    }, [parentHoverSelector, handleParentHover]);

    const handleFocus = () => {
        if (focus) {
            api.start({ ...focus.to, config });
        }
    };

    const handleBlur = () => {
        if (focus) {
            api.start({ ...focus.from, config });
        }
    };

    const handleClick = () => {
        if (click) {
            setIsClicked(!isClicked);
            api.start({ ...(isClicked ? click.from : click.to), config });
        }
    };

    useEffect(() => {
        if (scroll && inView) {
            api.start({ ...scroll.to, config });
        }
    }, [inView, scroll, api, config]);

    useEffect(() => {
        if (mount) {
            api.start({ ...mount.to, config });
        }
        return () => {
            if (unmount) {
                api.start({ ...unmount.to, config });
            }
        };
    }, [mount, unmount, api, config]);

    const bindDrag = useGesture({
        onDrag: ({ dragging }) => {
            if (drag) {
                api.start({ ...(dragging ? drag.to : drag.from), config });
            }
        },
    });

    useEffect(() => {
        const handleResize = () => {
            if (resize) {
                api.start({ ...resize.to, config });
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [resize, api, config]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (keyboard && event.key === keyboard.key) {
                api.start({ ...keyboard.to, config });
            }
        };
        const handleKeyUp = (event: KeyboardEvent) => {
            if (keyboard && event.key === keyboard.key) {
                api.start({ ...keyboard.from, config });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [keyboard, api, config]);

    const bindTouch = useGesture({
        onPointerDown: () => {
            if (touch) {
                api.start({ ...touch.to, config });
            }
        },
        onPointerUp: () => {
            if (touch) {
                api.start({ ...touch.from, config });
            }
        },
    });

    useEffect(() => {
        if (custom && custom.trigger && custom.trigger()) {
            api.start({ ...custom.to, config });
        }
    }, [custom, api, config]);

    const AnimatedComponent =
        (animated[as as keyof typeof animated] as React.ElementType) || animated(as);

    const safeSprings = normalizeKeys(springs as Record<string, SpringStyles>);
    return (
        <AnimatedComponent
            /* ref={(node: HTMLElement) => {
                elementRef.current = node;
                inViewRef(node);
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref && 'current' in ref) {
                    (ref as React.RefObject<HTMLElement>).current = node;
                }
            }} */
            ref={mergedRef}
            {...(hover ? bindHover() : {})}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClick={handleClick}
            {...(drag ? bindDrag() : {})}
            {...(touch ? bindTouch() : {})}
            {...rest}
            style={{
                ...safeSprings,
                ...(animationStyle ?? {}),
            }}
            htmlFor={htmlFor}
            type={type}
        >
            {trail && Array.isArray(children)
                ? trailSprings.map((style, index) => {
                      const TrailComponent =
                          (animated[as as keyof typeof animated] as React.ElementType) ||
                          animated(as);
                      return (
                          <TrailComponent key={index} style={style}>
                              {children[index]}
                          </TrailComponent>
                      );
                  })
                : children}
        </AnimatedComponent>
    );
};

export default forwardRef(AnimatedWrapper);
