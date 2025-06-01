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
import { fetchArticles } from '@/slices/articleSlice';
import { fetchViews } from '@/slices/viewSlice';
import { fetchSubscribers } from '@/slices/subscriberSlice';
import {
    loadDummyAnalytics,
    fetchAnalyticsLive,
    selectAnalytics,
    /* selectAnalyticsLoading, */
} from '@/slices/analyticsSlice';
import { fillMissingDates } from '@/utils/dateHelpers';

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
    /* const isAnalyticsLoading = useSelector(selectAnalyticsLoading); */
    const router = useRouter();
    const token = useSelector(selectToken);
    const isAuthLoading = useSelector(selectAuthIsLoading);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [chartData, setChartData] = useState<ChartData>({
        pageViews: [],
        subscriberStats: [],
        categoryStats: [],
        voteStats: [],
        commentStats: [],
    });

    // Authentication check
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

    // Main data loading effect
    useEffect(() => {
        if (!isAuthLoading) {
            const loadData = async () => {
                try {
                    setLoadError(null);

                    // Load prerequisite data
                    await dispatch(fetchArticles()).unwrap();
                    await dispatch(fetchViews()).unwrap();
                    await dispatch(fetchSubscribers()).unwrap();

                    // Load analytics
                    dispatch(loadDummyAnalytics());
                    await dispatch(fetchAnalyticsLive()).unwrap();
                } catch (err) {
                    console.error('[Layout] Data loading error:', err);
                    setLoadError('Failed to load data');
                }
            };

            loadData();
        }
    }, [dispatch, isAuthLoading]);

    // Update chart data when analytics changes
    useEffect(() => {
        if (analytics) {
            setChartData({
                pageViews: fillMissingDates(analytics.pageViews),
                subscriberStats: analytics.subscribers ?? [],
                categoryStats: analytics.articleStats ?? [],
                voteStats: analytics.votes ?? [],
                commentStats: analytics.comments ?? [],
            });
            setIsReady(true);
        }
    }, [analytics]);

    useEffect(() => {
        console.log('Analytics data:', analytics);
    }, [analytics]);

    // Block render until auth check is done
    if (isAuthLoading || (!token && typeof window !== 'undefined')) {
        return null; // Or a spinner
    }
    
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
