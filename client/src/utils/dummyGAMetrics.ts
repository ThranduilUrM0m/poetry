// utils/dummyGAMetrics.ts

export interface AnalyticsData {
    pageViews: { date: string; views: number }[];
    subscribers: { date: string; count: number }[];
    articleStats: { category: string; count: number }[];
    votes: { articleTitle: string; votes: number }[];
    comments: { articleTitle: string; comments: number }[];
    attractions: { articleTitle: string; attractions: number }[];
    audienceDemographics: {
        age: Record<string, number>;
        gender: { male: number; female: number; other: number };
        interests: Record<string, number>;
        geographic: Record<string, number>;
    };
    deviceInsights: {
        deviceTypes: Record<string, number>;
        operatingSystems: Record<string, number>;
        browsers: Record<string, number>;
        screenResolution: Record<string, number>;
    };
    engagementMetrics: {
        sessionDuration: number;
        pagesPerSession: number;
        returningUsers: number;
        newUsers: number;
    };
    acquisitionChannels: {
        trafficSources: Record<string, number>;
        campaignPerformance: Record<string, number>;
    };
    userBehavior: {
        pageViewsDetail: Record<string, number>;
        eventTracking: Record<string, number>;
        siteSpeed: number;
    };
    realTimeAnalytics: {
        activeUsers: number;
        pagesBeingViewed: Record<string, number>;
        liveEvents: Record<string, number>;
    };
    enhancedMetrics: {
        scrollTracking: number;
        outboundClicks: number;
        siteSearchQueries: Record<string, number>;
        fileDownloads: Record<string, number>;
    };
    conversionTracking: {
        goals: Record<string, number>;
        eCommerce: {
            revenue: number;
            checkoutBehavior: Record<string, number>;
        };
    };
}

export const dummyGAMetrics: AnalyticsData = {
    // Page Views (today, yesterday, last week, etc.)
    pageViews: [
        { date: new Date().toISOString().split('T')[0], views: 245 },
        { date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], views: 188 },
        { date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], views: 167 },
        { date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], views: 142 },
        { date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], views: 158 },
        { date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], views: 176 },
        { date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], views: 198 },
        { date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0], views: 167 },
        // … add your full 6-month sampling here …
    ],

    // Fallback arrays for metrics we’ll fetch dynamically
    subscribers: [],
    articleStats: [],
    votes: [],
    comments: [],
    attractions: [],

    // Dummy Google-like metrics (audience, device, etc.)
    audienceDemographics: {
        age: { '18-24': 150, '25-34': 100, '35-44': 50 },
        gender: { male: 180, female: 120, other: 10 },
        interests: { tech: 200, sports: 70, music: 50 },
        geographic: { USA: 150, Canada: 50, UK: 60 },
    },
    deviceInsights: {
        deviceTypes: { desktop: 200, mobile: 150, tablet: 50 },
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
        pageViewsDetail: { homepage: 150, blog: 100, contact: 30 },
        eventTracking: { click: 200, formSubmit: 50, videoPlay: 30 },
        siteSpeed: 2.5,
    },
    realTimeAnalytics: {
        activeUsers: 25,
        pagesBeingViewed: { homepage: 10, blog: 8, dashboard: 7 },
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
