// /src/context/SearchModalContext.tsx
'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
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

    const openModal = (newFilters: SearchModalFilters = {}) => {
        // Ensure we set filters before opening the modal
        setFilters(newFilters);
        // Use requestAnimationFrame to ensure state is updated
        requestAnimationFrame(() => {
            setIsOpen(true);
        });
    };

    const closeModal = () => {
        setIsOpen(false);
        // Clear filters after modal is closed
        setTimeout(() => {
            setFilters(null);
        }, 300); // Add delay to match animation duration
    };

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
