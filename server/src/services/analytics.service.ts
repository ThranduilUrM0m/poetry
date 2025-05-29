import { Injectable } from '@nestjs/common';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

@Injectable()
export class AnalyticsService {
    private analyticsClient: BetaAnalyticsDataClient;

    constructor() {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);

        this.analyticsClient = new BetaAnalyticsDataClient({
            credentials: {
                client_email: serviceAccount.client_email,
                private_key: serviceAccount.private_key.replace(/\\n/g, '\n'), // Ensure escaped newlines work
            },
        });
    }

    async fetchLiveGAData() {
        const propertyId = process.env.GA_PROPERTY_ID;

        if (!propertyId) {
            throw new Error('Missing GA_PROPERTY_ID environment variable.');
        }

        const [response] = await this.analyticsClient.runReport({
            property: `properties/${propertyId}`,
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }],
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        });

        return response;
    }
}
