'use client';
import React, { createContext, useContext } from 'react';

interface TimeSeriesDataItem {
    date: string | Date;
    views?: number;
    count?: number;
    value?: number;
    rate?: number;
}

interface CategoricalDataItem {
    category?: string;
    articleTitle?: string;
    count?: number;
    votes?: number;
    comments?: number;
    percentage?: number;
    trend?: 'up' | 'down' | 'stable';
}

interface DashboardContextType {
    loadError: string | null;
    isReady: boolean;
    chartData: {
        // Original dashboard data
        pageViews: TimeSeriesDataItem[];
        subscriberStats: TimeSeriesDataItem[];
        // New articles page data
        categoryStats: CategoricalDataItem[];
        voteStats: CategoricalDataItem[];
        commentStats: CategoricalDataItem[];
    };
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({
    children,
    value,
}: {
    children: React.ReactNode;
    value: DashboardContextType;
}) {
    return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
