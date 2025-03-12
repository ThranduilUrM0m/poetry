import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { SubscriberService } from '../services/subscriber.service';
import { Subscriber } from '../models/subscriber.model';

@Controller('api/subscribers')
export class SubscriberController {
    constructor(private readonly subscriberService: SubscriberService) {}

    @Post()
    async subscribe(@Body('email') email: string) {
        await this.subscriberService.subscribe(email);
        return { message: 'Subscription successful!' };
    }

    @Post('unsubscribe')
    async unsubscribe(@Body('email') email: string) {
        await this.subscriberService.unsubscribe(email);
        return { message: 'Unsubscription successful!' };
    }

    @Get()
    async getAllSubscribers(): Promise<Subscriber[]> {
        const subscribers = await this.subscriberService.getAllSubscribers();
        return subscribers;
    }

    @Get(':email')
    async getSubscriberBySlug(@Param('email') email: string): Promise<Subscriber> {
        const subscriber = await this.subscriberService.findBySlug(email);
        if (!subscriber) {
            throw new NotFoundException('Subscriber not found');
        }
        return subscriber;
    }
}
