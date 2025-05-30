import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { AnalyticsData, dummyGAMetrics } from '../utils/dummyGAMetrics'; // Add this import

@Injectable()
export class AnalyticsService {
    private analyticsClient: BetaAnalyticsDataClient;

    constructor() {
        const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!raw) {
            throw new InternalServerErrorException(
                'FIREBASE_SERVICE_ACCOUNT env var is not defined'
            );
        }

        let serviceAccount: { client_email: string; private_key: string };
        try {
            serviceAccount = JSON.parse(raw);
        } catch (e) {
            throw new InternalServerErrorException('FIREBASE_SERVICE_ACCOUNT is not valid JSON');
        }

        if (!serviceAccount.client_email || !serviceAccount.private_key) {
            throw new InternalServerErrorException(
                'FIREBASE_SERVICE_ACCOUNT JSON is missing client_email or private_key'
            );
        }

        this.analyticsClient = new BetaAnalyticsDataClient({
            credentials: {
                client_email: serviceAccount.client_email,
                private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
            },
            clientConfig: {
                interfaces: {
                    'google.analytics.data.v1beta.BetaAnalyticsData': {
                        methods: { RunReport: { timeout_millis: 300_000 } },
                    },
                },
            },
        });
    }

    async fetchLiveGAData(): Promise<AnalyticsData> {
        const propertyId = process.env.GA_PROPERTY_ID;
        if (!propertyId) {
            throw new InternalServerErrorException('GA_PROPERTY_ID env var is not defined');
        }

        // Fetch page views data
        const [pageViewsResponse] = await this.analyticsClient.runReport({
            property: `properties/${propertyId}`,
            dimensions: [{ name: 'date' }],
            metrics: [{ name: 'screenPageViews' }],
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        });

        // Fetch additional metrics
        const [metricsResponse] = await this.analyticsClient.runReport({
            property: `properties/${propertyId}`,
            dimensions: [
                { name: 'pagePath' },
                { name: 'deviceCategory' },
                { name: 'userAgeBracket' },
            ],
            metrics: [{ name: 'screenPageViews' }, { name: 'newUsers' }, { name: 'activeUsers' }],
            dateRanges: [{ startDate: 'yesterday', endDate: 'today' }],
        });

        // Transform page views data
        const pageViews: { date: string; views: number }[] = [];
        if (pageViewsResponse.rows) {
            pageViewsResponse.rows.forEach((row) => {
                const dateValue = row.dimensionValues?.[0]?.value ?? '';
                const viewsValue = row.metricValues?.[0]?.value ?? '0';

                if (dateValue) {
                    const formattedDate = `${dateValue.substring(0, 4)}-${dateValue.substring(4, 6)}-${dateValue.substring(6, 8)}`;
                    const views = parseInt(viewsValue, 10) || 0;
                    pageViews.push({ date: formattedDate, views });
                }
            });
        }

        // Transform additional metrics
        const userBehavior: Record<string, number> = {};
        const deviceInsights: Record<string, number> = {};
        const audienceDemographics: Record<string, number> = {};
        let newUsers = 0;
        let returningUsers = 0;

        if (metricsResponse.rows) {
            metricsResponse.rows.forEach((row) => {
                const pagePath = row.dimensionValues?.[0]?.value ?? 'unknown';
                const deviceType = row.dimensionValues?.[1]?.value ?? 'unknown';
                const ageBracket = row.dimensionValues?.[2]?.value ?? 'unknown';

                const views = parseInt(row.metricValues?.[0]?.value ?? '0', 10) || 0;
                const newUsersCount = parseInt(row.metricValues?.[1]?.value ?? '0', 10) || 0;
                const activeUsers = parseInt(row.metricValues?.[2]?.value ?? '0', 10) || 0;

                // Track most viewed pages
                userBehavior[pagePath] = (userBehavior[pagePath] || 0) + views;

                // Track device distribution
                deviceInsights[deviceType] = (deviceInsights[deviceType] || 0) + activeUsers;

                // Track age demographics
                audienceDemographics[ageBracket] =
                    (audienceDemographics[ageBracket] || 0) + activeUsers;

                // Track user metrics
                newUsers += newUsersCount;
                returningUsers += activeUsers - newUsersCount;
            });
        }

        // After fetching data
        const hasRealData =
            pageViews.length > 0 ||
            Object.keys(userBehavior).length > 0 ||
            Object.keys(deviceInsights).length > 0;

        if (!hasRealData) {
            console.warn('No real GA data found, using dummy fallback');
            return dummyGAMetrics;
        }

        // Create the final response object
        return {
            ...dummyGAMetrics, // Use dummy data as base
            pageViews,
            engagementMetrics: {
                ...dummyGAMetrics.engagementMetrics,
                newUsers,
                returningUsers,
            },
            userBehavior: {
                ...dummyGAMetrics.userBehavior,
                pageViewsDetail: userBehavior,
            },
            deviceInsights: {
                ...dummyGAMetrics.deviceInsights,
                deviceTypes: deviceInsights,
            },
            audienceDemographics: {
                ...dummyGAMetrics.audienceDemographics,
                age: audienceDemographics,
            },
        };
    }
}
