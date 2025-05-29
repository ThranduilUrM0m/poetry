import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

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
        });
    }

    async fetchLiveGAData() {
        const propertyId = process.env.GA_PROPERTY_ID;
        if (!propertyId) {
            throw new InternalServerErrorException('GA_PROPERTY_ID env var is not defined');
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
