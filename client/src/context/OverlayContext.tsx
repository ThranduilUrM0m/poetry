import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface OverlayState {
    isVisible: boolean;
    zIndex?: number;
    blurClass?: string;
    onClick?: () => void;
}

const OverlayContext = createContext<{
    showOverlay: (options?: Omit<OverlayState, 'isVisible'>) => void;
    hideOverlay: () => void;
    overlayState: OverlayState;
}>({
    showOverlay: () => {},
    hideOverlay: () => {},
    overlayState: { isVisible: false },
});

export const OverlayProvider = ({ children }: { children: ReactNode }) => {
    const [overlayState, setOverlayState] = useState<OverlayState>({ isVisible: false });

    const showOverlay = useCallback((options = {}) => {
        setOverlayState({ ...options, isVisible: true });
    }, []);
    const hideOverlay = useCallback(() => {
        setOverlayState({ isVisible: false });
    }, []);

    return (
        <OverlayContext.Provider value={{ showOverlay, hideOverlay, overlayState }}>
            {children}
        </OverlayContext.Provider>
    );
};

export const useOverlay = () => useContext(OverlayContext);
