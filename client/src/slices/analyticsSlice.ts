/**
 * analyticsSlice.ts
 * -----------------
 * This Redux slice computes comprehensive analytics data by combining aggregated metrics
 * from your existing slices (articles, comments, votes, views, subscribers) with additional
 * Google Analytics–like data (provided as dummy metrics). This approach assumes that your other
 * slices already retrieve data from your backend services (with database fallback handling).
 *
 * The computed metrics include:
 *   - Page views grouped by date (derived from the views slice)
 *   - Subscriber counts grouped by date (derived from the subscriber slice)
 *   - Article statistics (articles per category)
 *   - Per-article vote and comment counts
 *
 * And then these are merged with additional dummy metrics (audience demographics, device insights,
 * engagement, acquisition, user behavior, real-time analytics, enhanced metrics, and conversion tracking).
 *
 * The aggregated analytics is calculated in the async thunk 'calculateAnalytics'.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { Article } from '@/types/article';

// ----------------------------------------------------------------------
// Define Interfaces for Analytics Data
// ----------------------------------------------------------------------

export interface AnalyticsData {
    // Aggregated data derived from your models/slices
    pageViews: { date: string; views: number }[];
    subscribers: { date: string; count: number }[];
    articleStats: { category: string; count: number }[];
    votes: { articleTitle: string; votes: number }[];
    comments: { articleTitle: string; comments: number }[];
    attractions: { articleTitle: string; attractions: number }[]; // Custom metric (if applicable)

    // Additional Google Analytics–like metrics (dummy values for now)
    audienceDemographics: {
        age: { [range: string]: number };
        gender: { male: number; female: number; other: number };
        interests: { [interest: string]: number };
        geographic: { [location: string]: number };
    };
    deviceInsights: {
        deviceTypes: { [type: string]: number };
        operatingSystems: { [os: string]: number };
        browsers: { [browser: string]: number };
        screenResolution: { [resolution: string]: number };
    };
    engagementMetrics: {
        sessionDuration: number; // seconds
        pagesPerSession: number;
        returningUsers: number;
        newUsers: number;
    };
    acquisitionChannels: {
        trafficSources: { [source: string]: number };
        campaignPerformance: { [campaign: string]: number };
    };
    userBehavior: {
        pageViewsDetail: { [page: string]: number };
        eventTracking: { [eventName: string]: number };
        siteSpeed: number; // average page load time in seconds
    };
    realTimeAnalytics: {
        activeUsers: number;
        pagesBeingViewed: { [page: string]: number };
        liveEvents: { [event: string]: number };
    };
    enhancedMetrics: {
        scrollTracking: number; // percentage (dummy average)
        outboundClicks: number;
        siteSearchQueries: { [query: string]: number };
        fileDownloads: { [fileName: string]: number };
    };
    conversionTracking: {
        goals: { [goal: string]: number };
        eCommerce: {
            revenue: number;
            checkoutBehavior: { [step: string]: number };
        };
    };
}

// ----------------------------------------------------------------------
// Dummy Data for Additional Metrics (Google Analytics–like)
// ----------------------------------------------------------------------
const dummyGAMetrics: AnalyticsData = {
    pageViews: [
        // Last 24 hours data (today and yesterday)
        { date: new Date().toISOString().split('T')[0], views: 245 },
        { date: new Date(Date.now() - 86400000).toISOString().split('T')[0], views: 188 },

        // Last week
        { date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], views: 167 },
        { date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], views: 142 },
        { date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], views: 158 },
        { date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], views: 176 },
        { date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], views: 198 },
        { date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], views: 167 },

        // Last month (sampling every 3-4 days)
        { date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0], views: 156 },
        { date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0], views: 178 },
        { date: new Date(Date.now() - 17 * 86400000).toISOString().split('T')[0], views: 189 },
        { date: new Date(Date.now() - 21 * 86400000).toISOString().split('T')[0], views: 234 },
        { date: new Date(Date.now() - 24 * 86400000).toISOString().split('T')[0], views: 267 },
        { date: new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0], views: 208 },
        { date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0], views: 189 },

        // 6 months data (sampling every 15-20 days)
        { date: new Date(Date.now() - 45 * 86400000).toISOString().split('T')[0], views: 178 },
        { date: new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0], views: 156 },
        { date: new Date(Date.now() - 75 * 86400000).toISOString().split('T')[0], views: 145 },
        { date: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0], views: 167 },
        { date: new Date(Date.now() - 105 * 86400000).toISOString().split('T')[0], views: 178 },
        { date: new Date(Date.now() - 120 * 86400000).toISOString().split('T')[0], views: 189 },
        { date: new Date(Date.now() - 135 * 86400000).toISOString().split('T')[0], views: 167 },
        { date: new Date(Date.now() - 150 * 86400000).toISOString().split('T')[0], views: 178 },
        { date: new Date(Date.now() - 165 * 86400000).toISOString().split('T')[0], views: 198 },
        { date: new Date(Date.now() - 180 * 86400000).toISOString().split('T')[0], views: 187 },
    ],
    subscribers: [], // Add empty arrays for these fields
    articleStats: [],
    votes: [],
    comments: [],
    attractions: [],
    audienceDemographics: {
        age: { '18-24': 150, '25-34': 100, '35-44': 50 },
        gender: { male: 180, female: 120, other: 10 },
        interests: { tech: 200, sports: 70, music: 50 },
        geographic: { USA: 150, Canada: 50, UK: 60 },
    },
    deviceInsights: {
        deviceTypes: { desktop: 200, mobile: 150, tablet: 50 }, // Ensure this is included
        operatingSystems: { Windows: 120, macOS: 80, Android: 100, iOS: 100 },
        browsers: { Chrome: 200, Firefox: 50, Safari: 80, Edge: 70 },
        screenResolution: { '1920x1080': 150, '1366x768': 100, '1440x900': 50 },
    },
    engagementMetrics: {
        sessionDuration: 300,
        pagesPerSession: 4,
        returningUsers: 120,
        newUsers: 80,
    },
    acquisitionChannels: {
        trafficSources: { organic: 200, direct: 100, referral: 50, social: 75, paid: 25 },
        campaignPerformance: { campaignA: 100, campaignB: 50 },
    },
    userBehavior: {
        pageViewsDetail: { 'homepage': 150, 'blog': 100, 'contact': 30 },
        eventTracking: { click: 200, formSubmit: 50, videoPlay: 30 },
        siteSpeed: 2.5,
    },
    realTimeAnalytics: {
        activeUsers: 25,
        pagesBeingViewed: { 'homepage': 10, 'blog': 8, 'dashboard': 7 },
        liveEvents: { liveChat: 5 },
    },
    enhancedMetrics: {
        scrollTracking: 80,
        outboundClicks: 40,
        siteSearchQueries: { 'nextjs analytics': 20, 'redux toolkit': 10 },
        fileDownloads: { 'brochure.pdf': 15 },
    },
    conversionTracking: {
        goals: { signUp: 50, purchase: 20 },
        eCommerce: { revenue: 5000, checkoutBehavior: { started: 100, completed: 50 } },
    },
};

// ----------------------------------------------------------------------
// Analytics Slice State Interface & Initial State
// ----------------------------------------------------------------------
interface AnalyticsState {
    data: AnalyticsData;
    isCalculating: boolean;
    error: string | null;
}

// We'll prepopulate the GA–like metrics using dummy data. The aggregated parts
// (pageViews, subscribers, articleStats, votes, comments, attractions) will be computed.
const initialState: AnalyticsState = {
    data: {
        ...dummyGAMetrics,
        subscribers: [],
        articleStats: [],
        votes: [],
        comments: [],
        attractions: [],
    },
    isCalculating: false,
    error: null,
};

// ----------------------------------------------------------------------
// Helper Functions for Calculations
// ----------------------------------------------------------------------

/**
 * groupByDate
 * Groups an array of objects (that have a 'createdAt' field) by the date portion (YYYY-MM-DD).
 */
const groupByDate = (records: { createdAt?: string }[]): { [date: string]: number } => {
    return records.reduce((acc, record) => {
        if (record.createdAt) {
            const date = record.createdAt.substring(0, 10); // Extract YYYY-MM-DD
            acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
    }, {} as { [date: string]: number });
};

/**
 * groupByCategory
 * Groups an array of articles by their 'category' field.
 */
const groupByCategory = (articles: { category: string }[]): { [cat: string]: number } => {
    return articles.reduce((acc, article) => {
        const category = article.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {} as { [cat: string]: number });
};

/**
 * computeArticleMetric
 * Computes per-article metrics (votes, comments, attractions) from articles.
 * Assumes each article object has a title and arrays for votes and comments.
 */
const computeArticleMetrics = (articles: Article[]) => {
    const votes = articles.map((article) => ({
        articleTitle: article.title,
        votes: Array.isArray(article.votes) ? article.votes.length : 0,
    }));
    const comments = articles.map((article) => ({
        articleTitle: article.title,
        comments: Array.isArray(article.comments) ? article.comments.length : 0,
    }));
    // For "attractions", if you don't have a dedicated field, you can compute it as a placeholder (e.g., random or derived from other data)
    const attractions = articles.map((article) => ({
        articleTitle: article.title,
        attractions: Math.floor(Math.random() * 10), // For illustration purposes only
    }));
    return { votes, comments, attractions };
};

/**
 * calculateAnalytics
 * Combines data from various slices (articles, comments, views, subscribers)
 * and computes the aggregated analytics metrics.
 */
const calculateAnalytics = (state: RootState): AnalyticsData => {
    // Retrieve data from other slices
    const articles = state.article.articles || [];
    const views = state.view.views || [];
    const subscribers = state.subscriber.subscribers || [];

    // Calculate real metrics with fallbacks to dummy data
    let pageViews: AnalyticsData['pageViews'] = dummyGAMetrics.pageViews || [];
    if (views.length > 0) {
        const realViews = Object.keys(groupByDate(views)).map((date) => ({
            date,
            views: groupByDate(views)[date],
        }));
        // Only override dummy data if we have real data
        if (realViews.length > 0) {
            pageViews = realViews;
        }
    }

    // Calculate subscriber trends with fallback
    let subscribersByDate: AnalyticsData['subscribers'] = [];
    if (subscribers.length > 0) {
        const realSubscribers = Object.keys(groupByDate(subscribers)).map((date) => ({
            date,
            count: groupByDate(subscribers)[date],
        }));
        if (realSubscribers.length > 0) {
            subscribersByDate = realSubscribers;
        }
    }

    // Calculate article stats with fallback
    let articleStats: AnalyticsData['articleStats'] = [];
    if (articles.length > 0) {
        articleStats = Object.keys(groupByCategory(articles)).map((cat) => ({
            category: cat || 'uncategorized',
            count: groupByCategory(articles)[cat],
        }));
    }

    // Calculate article metrics with proper typing
    const { votes, comments, attractions } =
        articles.length > 0
            ? computeArticleMetrics(articles)
            : {
                  votes: [] as AnalyticsData['votes'],
                  comments: [] as AnalyticsData['comments'],
                  attractions: [] as AnalyticsData['attractions'],
              };

    // Ensure we always have complete data by merging with dummy data
    const analyticsData: AnalyticsData = {
        pageViews: pageViews || [],
        subscribers: subscribersByDate || [],
        articleStats: articleStats || [],
        votes: votes || [],
        comments: comments || [],
        attractions: attractions || [],
        audienceDemographics: dummyGAMetrics.audienceDemographics,
        deviceInsights: dummyGAMetrics.deviceInsights,
        engagementMetrics: dummyGAMetrics.engagementMetrics,
        acquisitionChannels: dummyGAMetrics.acquisitionChannels,
        userBehavior: dummyGAMetrics.userBehavior,
        realTimeAnalytics: dummyGAMetrics.realTimeAnalytics,
        enhancedMetrics: dummyGAMetrics.enhancedMetrics,
        conversionTracking: dummyGAMetrics.conversionTracking,
    };

    return analyticsData;
};

// ----------------------------------------------------------------------
// Async Thunk: calculateAnalyticsThunk
// ----------------------------------------------------------------------
/**
 * This async thunk uses getState to derive aggregated analytics metrics from the data already present
 * in other slices. It does not perform a separate API call.
 */
export const calculateAnalyticsThunk = createAsyncThunk(
    'analytics/calculate',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            // Calculate aggregated analytics metrics.
            const aggregatedData = calculateAnalytics(state);
            return aggregatedData;
        } catch (error) {
            console.error('Error calculating analytics metrics:', error);
            return rejectWithValue('Failed to calculate analytics metrics.');
        }
    }
);

// ----------------------------------------------------------------------
// Analytics Slice Definition
// ----------------------------------------------------------------------
const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        resetAnalytics(state) {
            state.data = dummyGAMetrics; // Now using the complete AnalyticsData object
            state.isCalculating = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(calculateAnalyticsThunk.pending, (state) => {
                state.isCalculating = true;
                state.error = null;
            })
            .addCase(
                calculateAnalyticsThunk.fulfilled,
                (state, action: PayloadAction<AnalyticsData>) => {
                    state.data = action.payload;
                    state.isCalculating = false;
                }
            )
            .addCase(calculateAnalyticsThunk.rejected, (state, action) => {
                state.isCalculating = false;
                state.error =
                    (action.payload as string) || 'Failed to calculate analytics metrics.';
            });
    },
});

// ----------------------------------------------------------------------
// Selectors
// ----------------------------------------------------------------------
export const selectAnalytics = (state: RootState) => state.analytics.data;
export const selectAnalyticsCalculating = (state: RootState) => state.analytics.isCalculating;
export const selectAnalyticsError = (state: RootState) => state.analytics.error;

// Export reducer and actions.
export const { resetAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
