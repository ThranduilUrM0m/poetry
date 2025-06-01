// hooks/useMergedRef.ts
import { useCallback/* , useRef */ } from 'react';
import type { MutableRefObject, RefCallback } from 'react';

/**
 * useMergedRef
 * Accepts any number of refs (either callback refs or ref objects),
 * returns a single stable callback ref. Internally, it updates all passed refs
 * whenever a node is attached/detached.
 */
export function useMergedRef<T>(
    ...refs: Array<RefCallback<T> | MutableRefObject<T | null> | undefined>
): RefCallback<T> {
    // We store a stable function via `useCallback`.
    const mergedRef = useCallback(
        (node: T) => {
            for (const ref of refs) {
                if (!ref) continue;
                if (typeof ref === 'function') {
                    ref(node);
                } else {
                    // Assumes ref is RefObject
                    (ref as MutableRefObject<T | null>).current = node;
                }
            }
        },
        // We intentionally list `refs` array as dependency, but since each element is
        // typically stable (created once), the function remains stable across re‐renders.
        // If any of the passed‐in refs come from props, they should be memoized too.
        [refs]
    );

    return mergedRef;
}
