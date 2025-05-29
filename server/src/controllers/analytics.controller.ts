import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';

@Controller('api/analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get('live')
    async getLiveAnalytics() {
        return this.analyticsService.fetchLiveGAData();
    }
}
