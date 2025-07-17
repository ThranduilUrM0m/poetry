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
    // 2. CLIENT-SIDE: Redux logic and fallback checks (for token expiry, etc.)
    //    This code runs on the client after server-side check passes.
    //    All Redux selectors, dispatches, and chart logic are preserved.

    // --- Begin original client-side logic ---
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

    // 3. CLIENT-SIDE AUTH FALLBACK: Handles token expiration or manual tampering.
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
                // If token is expired or invalid, clear and redirect.
                console.log(error);
                dispatch(clearAuth());
                localStorage.removeItem('token');
                router.push('/login');
            }
        };
        checkAuth();
    }, [dispatch, router, token]);

    // 4. DATA LOADING: Only runs after auth is validated.
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

    // 5. CHART DATA: Update when analytics changes.
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

    // 6. LOADING SPINNER: Show spinner while client-side auth is validating.
    if (!token || isAuthLoading) {
        // Show spinner while checking auth
        return <div className="dashboard__main-loader"></div>;
    }

    // --- Render dashboard as before ---
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
