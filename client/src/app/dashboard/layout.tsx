// dashboard/layout.tsx
'use client';
import React, { useEffect, useState } from 'react';
import DashboardWrapper from './DashboardWrapper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import SectionObserver from '@/components/SectionObserver';
import { selectToken, selectAuthIsLoading, clearAuth, setToken } from '@/slices/authSlice';
import { fetchUserProfile } from '@/slices/userSlice';

// Import prerequisite data slices
import { fetchArticles } from '@/slices/articleSlice';
import { fetchViews } from '@/slices/viewSlice';
import { fetchSubscribers } from '@/slices/subscriberSlice';

// Import aggregated analytics thunk and selectors.
import {
    loadDummyAnalytics,
    fetchAnalyticsLive,
    selectAnalytics
} from '@/slices/analyticsSlice';

// Interface for local chart data state (only including the data used here)
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const analytics = useSelector(selectAnalytics);

    const router = useRouter();

    // Retrieve auth-related data.
    const token = useSelector(selectToken);
    const isAuthLoading = useSelector(selectAuthIsLoading);

    // Retrieve aggregated analytics data.
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState<boolean>(false);

    // Local state for computed chart data (only required fields for this page)
    const [chartData, setChartData] = useState<ChartData>({
        pageViews: [],
        subscriberStats: [],
        categoryStats: [],
        voteStats: [],
        commentStats: [],
    });

    // Shared authentication check for all dashboard pages
    useEffect(() => {
        const checkAuth = async () => {
            const savedToken = localStorage.getItem('token');
            if (!token && !savedToken) {
                router.push('/login');
                return;
            }
            if (!token && savedToken) {
                dispatch(setToken(savedToken));
            }
            try {
                await dispatch(fetchUserProfile()).unwrap();
            } catch (error) {
                console.error('Authentication error:', error);
                dispatch(clearAuth());
                localStorage.removeItem('token');
                router.push('/login');
            }
        };
        checkAuth();
    }, [dispatch, router, token]);

    // Load prerequisite data and calculate analytics.
    useEffect(() => {
        if (!isAuthLoading) {
            const loadData = async (): Promise<void> => {
                try {
                    setLoadError(null);
                    await dispatch(fetchArticles()).unwrap();
                    await dispatch(fetchViews()).unwrap();
                    await dispatch(fetchSubscribers()).unwrap();

                    // Fetch GA analytics from backend
                    // 1️⃣ Show dummy immediately
                    dispatch(loadDummyAnalytics());
                    // 2️⃣ Then fetch real-time GA4 data
                    dispatch(fetchAnalyticsLive()).catch(console.error);

                    // Use analytics from the slice (which now contains backend GA data)
                    setChartData({
                        pageViews: analytics.pageViews || [],
                        subscriberStats: analytics.subscribers || [],
                        categoryStats: analytics.articleStats || [],
                        voteStats: analytics.votes || [],
                        commentStats: analytics.comments || [],
                    });

                    setIsReady(true);
                } catch (error) {
                    console.error('[Layout] Data loading error:', error);
                    setLoadError('Failed to load data');
                    setIsReady(false);
                }
            };
            loadData();
        }
        // Add analytics as a dependency so chartData updates when analytics updates
    }, [dispatch, isAuthLoading, analytics]);

    return (
        <main className="dashboard">
            <SectionObserver theme="light">
                <section className="dashboard__section-1 !py-0 !h-[125vh]">
                    <DashboardWrapper loadError={loadError} isReady={isReady} chartData={chartData}>
                        <Sidebar />
                        <div className="dashboard__main">
                            <Header />
                            {children}
                        </div>
                    </DashboardWrapper>
                </section>
            </SectionObserver>
        </main>
    );
}
