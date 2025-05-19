// /src/context/SearchModalContext.tsx
'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SearchSuggestion } from '@/types/search';

export type SortOption = 'trending' | 'mostViewed' | 'topRated' | 'mostRecent' | 'mostRelevant';
export type TimeFrameOption = '24h' | '7d' | '30d' | '6m' | 'all';

export interface SearchModalFilters {
    sortOption?: SortOption;
    timeFrameOption?: TimeFrameOption;
    initialSuggestions?: SearchSuggestion[];
    // Add additional filter properties if needed
}

interface SearchModalContextProps {
    isOpen: boolean;
    filters: SearchModalFilters | null;
    openModal: (filters?: SearchModalFilters) => void;
    closeModal: () => void;
}

const SearchModalContext = createContext<SearchModalContextProps | undefined>(undefined);

export const SearchModalProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [filters, setFilters] = useState<SearchModalFilters | null>(null);

    const openModal = useCallback((newFilters: SearchModalFilters = {}) => {
        setFilters(newFilters);
        requestAnimationFrame(() => {
            setIsOpen(true);
        });
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => {
            setFilters(null);
        }, 300);
    }, []);

    return (
        <SearchModalContext.Provider value={{ isOpen, filters, openModal, closeModal }}>
            {children}
        </SearchModalContext.Provider>
    );
};

export const useSearchModal = (): SearchModalContextProps => {
    const context = useContext(SearchModalContext);
    if (!context) {
        throw new Error('useSearchModal must be used within a SearchModalProvider');
    }
    return context;
};
