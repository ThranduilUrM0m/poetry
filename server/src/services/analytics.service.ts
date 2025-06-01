import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { AnalyticsData, dummyGAMetrics } from '../utils/dummyGAMetrics';

@Injectable()
export class AnalyticsService {
    private analyticsClient: BetaAnalyticsDataClient;

    constructor() {
        const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!raw)
            throw new InternalServerErrorException(
                'FIREBASE_SERVICE_ACCOUNT env var is not defined'
            );
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
        if (!propertyId)
            throw new InternalServerErrorException('GA_PROPERTY_ID env var is not defined');

        // 1. Page views by date
        const [pageViewsResponse] = await this.analyticsClient.runReport({
            property: `properties/${propertyId}`,
            dimensions: [{ name: 'date' }],
            metrics: [{ name: 'screenPageViews' }],
            dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
        });

        // 2. Page views by pageTitle
        const [pageTitleResponse] = await this.analyticsClient.runReport({
            property: `properties/${propertyId}`,
            dimensions: [{ name: 'pageTitle' }],
            metrics: [{ name: 'screenPageViews' }],
            dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
        });

        const [pagePathResponse] = await this.analyticsClient.runReport({
            property: `properties/${propertyId}`,
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }],
            dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
        });

        // Parse pagePathResponse for most viewed pages by path
        const pageViewsByPath: Record<string, number> = {};
        if (pagePathResponse.rows) {
            pagePathResponse.rows.forEach((row) => {
                const path = row.dimensionValues?.[0]?.value ?? 'unknown';
                const views = parseInt(row.metricValues?.[0]?.value ?? '0', 10) || 0;
                pageViewsByPath[path] = (pageViewsByPath[path] || 0) + views;
            });
        }

        // 3. Device, OS, browser
        const [deviceResponse] = await this.analyticsClient.runReport({
            property: `properties/${propertyId}`,
            dimensions: [
                { name: 'deviceCategory' },
                { name: 'operatingSystem' },
                { name: 'browser' },
            ],
            metrics: [{ name: 'activeUsers' }],
            dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
        });

        // 4. Age & Gender
        const [demographicsResponse] = await this.analyticsClient.runReport({
            property: `properties/${propertyId}`,
            dimensions: [{ name: 'userAgeBracket' }, { name: 'userGender' }],
            metrics: [{ name: 'activeUsers' }],
            dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
        });

        // 5. New/Returning Users
        const [userTypeResponse] = await this.analyticsClient.runReport({
            property: `properties/${propertyId}`,
            dimensions: [{ name: 'newVsReturning' }],
            metrics: [{ name: 'activeUsers' }],
            dateRanges: [{ startDate: '90daysAgo', endDate: 'today' }],
        });

        // --- Transform responses ---
        // Page views by date
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

        // Most viewed pages (by title)
        const pageViewsDetail: Record<string, number> = {};
        if (pageTitleResponse.rows) {
            pageTitleResponse.rows.forEach((row) => {
                const title = row.dimensionValues?.[0]?.value ?? 'unknown';
                const views = parseInt(row.metricValues?.[0]?.value ?? '0', 10) || 0;
                pageViewsDetail[title] = (pageViewsDetail[title] || 0) + views;
            });
        }

        // Device insights
        const deviceTypes: Record<string, number> = {};
        const operatingSystems: Record<string, number> = {};
        const browsers: Record<string, number> = {};
        if (deviceResponse.rows) {
            deviceResponse.rows.forEach((row) => {
                const device = row.dimensionValues?.[0]?.value ?? 'unknown';
                const os = row.dimensionValues?.[1]?.value ?? 'unknown';
                const browser = row.dimensionValues?.[2]?.value ?? 'unknown';
                const users = parseInt(row.metricValues?.[0]?.value ?? '0', 10) || 0;
                deviceTypes[device] = (deviceTypes[device] || 0) + users;
                operatingSystems[os] = (operatingSystems[os] || 0) + users;
                browsers[browser] = (browsers[browser] || 0) + users;
            });
        }

        // Age & Gender
        const age: Record<string, number> = {};
        const genderCounts: Record<string, number> = {};
        if (demographicsResponse.rows) {
            demographicsResponse.rows.forEach((row) => {
                const ageBracket = row.dimensionValues?.[0]?.value ?? 'unknown';
                const genderValue = row.dimensionValues?.[1]?.value ?? 'unknown';
                const users = parseInt(row.metricValues?.[0]?.value ?? '0', 10) || 0;
                age[ageBracket] = (age[ageBracket] || 0) + users;
                genderCounts[genderValue] = (genderCounts[genderValue] || 0) + users;
            });
        }
        // Ensure all required gender keys exist
        const gender = {
            male: genderCounts['male'] || 0,
            female: genderCounts['female'] || 0,
            other: genderCounts['other'] || 0,
        };

        // New/Returning Users
        let newUsers = 0;
        let returningUsers = 0;
        if (userTypeResponse.rows) {
            userTypeResponse.rows.forEach((row) => {
                const type = row.dimensionValues?.[0]?.value ?? '';
                const users = parseInt(row.metricValues?.[0]?.value ?? '0', 10) || 0;
                if (type === 'New') newUsers += users;
                else if (type === 'Returning') returningUsers += users;
            });
        }

        // Compose final response
        const hasRealData =
            pageViews.length > 0 ||
            Object.keys(pageViewsDetail).length > 0 ||
            Object.keys(deviceTypes).length > 0 ||
            Object.keys(age).length > 0 ||
            Object.keys(gender).length > 0;

        if (!hasRealData) {
            console.warn('No real GA data found, using dummy fallback');
            return dummyGAMetrics;
        }

        return {
            ...dummyGAMetrics,
            pageViews,
            engagementMetrics: {
                ...dummyGAMetrics.engagementMetrics,
                newUsers,
                returningUsers,
            },
            userBehavior: {
                ...dummyGAMetrics.userBehavior,
                pageViewsDetail, // by title
                pageViewsByPath, // by path
            },
            deviceInsights: {
                ...dummyGAMetrics.deviceInsights,
                deviceTypes,
                operatingSystems,
                browsers,
            },
            audienceDemographics: {
                ...dummyGAMetrics.audienceDemographics,
                age,
                gender,
            },
        };
    }
}
