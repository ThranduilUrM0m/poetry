'use client';
import React from 'react';
import { DashboardProvider } from '@/context/DashboardContext';

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

interface ChartData {
    pageViews: TimeSeriesDataItem[];
    subscriberStats: TimeSeriesDataItem[];
    categoryStats: CategoricalDataItem[];
    voteStats: CategoricalDataItem[];
    commentStats: CategoricalDataItem[];
}

interface DashboardPageProps {
    loadError: string | null;
    isReady: boolean;
    chartData: ChartData;
}

interface DashboardWrapperProps extends DashboardPageProps {
    children: React.ReactNode;
}

export default function DashboardWrapper({
    loadError,
    isReady,
    chartData,
    children,
}: DashboardWrapperProps) {
    return (
        <DashboardProvider value={{ loadError, isReady, chartData }}>{children}</DashboardProvider>
    );
}
