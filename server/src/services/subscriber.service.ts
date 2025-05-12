import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscriber, SubscriberDocument } from '../models/subscriber.model';
import { NotificationService } from './notification.service';

@Injectable()
export class SubscriberService {
    constructor(
        @InjectModel(Subscriber.name)
        private readonly subscriberModel: Model<SubscriberDocument>
    ) {}

    /**
     * Seed test data if collection is empty.
     */
    async ensureTestData(): Promise<void> {
        const count = await this.subscriberModel.countDocuments().exec();
        if (count === 0) {
            await this.subscriberModel.create([
                { email: 'test1@example.com', isSubscribed: true },
                { email: 'test2@example.com', isSubscribed: true },
                { email: 'test3@example.com', isSubscribed: true },
            ]);
        }
    }

    /**
     * Subscribe a new email.
     * @throws BadRequestException if already subscribed.
     */
    async subscribe(email: string): Promise<Subscriber> {
        const normalized = email.trim().toLowerCase();
        const exists = await this.subscriberModel.exists({ email: normalized }).exec();
        
        if (exists) {
            throw new BadRequestException('Email already subscribed');
        }

        const subscriber = new this.subscriberModel({
            email: normalized,
            isSubscribed: true,
        });

        return (await subscriber.save()).toObject();
    }

    /**
     * Unsubscribe an existing email.
     * @throws NotFoundException if subscriber not found.
     */
    async unsubscribe(email: string): Promise<Subscriber> {
        const normalized = email.trim().toLowerCase();

        const updated = await this.subscriberModel
            .findOneAndUpdate(
                { email: normalized },
                { isSubscribed: false },
                {
                    new: true,
                    runValidators: true,
                    lean: true,
                }
            )
            .exec();

        if (!updated) {
            throw new NotFoundException(`Subscriber with email "${email}" not found`);
        }

        return updated;
    }

    /**
     * Retrieve all subscribers.
     */
    async getAllSubscribers(): Promise<Subscriber[]> {
        return this.subscriberModel.find().lean().exec();
    }

    /**
     * Find a subscriber by email.
     * Returns null if not found — must be handled by the caller.
     */
    async findByEmail(email: string): Promise<Subscriber | null> {
        const normalized = email.trim().toLowerCase();
        return this.subscriberModel.findOne({ email: normalized }).lean().exec();
    }
}
