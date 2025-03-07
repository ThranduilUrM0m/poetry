'use client';

import { createContext, useContext } from 'react';

interface LoadingContextType {
    isLoaded: boolean;
}

export const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};
