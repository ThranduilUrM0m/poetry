// src/controllers/subscriber.controller.ts

import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { SubscriberService } from '../services/subscriber.service';
import { Subscriber } from '../models/subscriber.model';
import { NotificationService } from '../services/notification.service';
import { NotificationGateway } from '../gateways/notification.gateway';

@Controller('api/subscribers')
export class SubscriberController {
    constructor(
        private readonly subscriberService: SubscriberService,
        private readonly notificationService: NotificationService,
        private readonly notificationGateway: NotificationGateway
    ) {}

    /**
     * POST /api/subscribers
     * Subscribe a new email.
     */
    @Post()
    async subscribe(@Body('email') email: string): Promise<{ message: string }> {
        if (!email || typeof email !== 'string') {
            throw new BadRequestException('Email is required');
        }

        const subscriber = await this.subscriberService.subscribe(email);

        // Notification
        await this.notificationService.create({
            category: 'subscriber',
            action: 'subscribe',
            title: 'New Subscriber',
            message: `A new subscriber joined: ${email}`,
            metadata: { email },
        });

        // WebSocket broadcast for dashboard updates
        this.notificationGateway.server.emit('subscriber:changed', {
            type: 'subscribe',
            subscriber,
        });

        return { message: 'Subscription successful!' };
    }

    /**
     * POST /api/subscribers/unsubscribe
     * Unsubscribe an email.
     */
    @Post('unsubscribe')
    async unsubscribe(@Body('email') email: string): Promise<{ message: string }> {
        if (!email || typeof email !== 'string') {
            throw new BadRequestException('Email is required');
        }
        await this.subscriberService.unsubscribe(email);

        await this.notificationService.create({
            category: 'subscriber',
            action: 'unsubscribe',
            title: 'Unsubscribed',
            message: `A subscriber left: ${email}`,
            metadata: { email },
        });

        this.notificationGateway.server.emit('subscriber:changed', {
            type: 'unsubscribe',
            email,
        });

        return { message: 'Unsubscription successful!' };
    }

    /**
     * GET /api/subscribers
     * Retrieve all subscribers.
     */
    @Get()
    async getAll(): Promise<Subscriber[]> {
        return this.subscriberService.getAllSubscribers();
    }

    /**
     * GET /api/subscribers/:email
     * Retrieve a subscriber by email.
     */
    @Get(':email')
    async getOne(@Param('email') email: string): Promise<Subscriber> {
        const subscriber = await this.subscriberService.findByEmail(email);
        if (!subscriber) {
            throw new NotFoundException('Subscriber not found');
        }
        return subscriber;
    }
}
