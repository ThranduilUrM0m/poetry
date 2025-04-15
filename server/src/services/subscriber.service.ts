import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscriber, SubscriberDocument } from '../models/subscriber.model';

@Injectable()
export class SubscriberService {
    constructor(@InjectModel(Subscriber.name) private subscriberModel: Model<SubscriberDocument>) {}

    async ensureTestData() {
        const count = await this.subscriberModel.countDocuments();
        if (count === 0) {
            console.log('Adding test subscribers...');
            await this.subscriberModel.create([
                { email: 'test1@example.com', isSubscribed: true },
                { email: 'test2@example.com', isSubscribed: true },
                { email: 'test3@example.com', isSubscribed: true }
            ]);
        }
    }
    
    async subscribe(email: string): Promise<Subscriber> {
        const existingSubscriber = await this.subscriberModel.findOne({ email }).exec();
        if (existingSubscriber) {
            throw new Error('Email already subscribed');
        }
        const subscriber = new this.subscriberModel({ email });
        return subscriber.save();
    }

    async getAllSubscribers(): Promise<Subscriber[]> {
        try {
            const subscribers = await this.subscriberModel.find().exec();
            console.log(`Found ${subscribers.length} subscribers`);
            return subscribers;
        } catch (error) {
            console.error('Error fetching subscribers:', error);
            throw new Error('Failed to fetch subscribers');
        }
    }

    async getSubscriberBySlug(email: string): Promise<Subscriber> {
        const subscriber = await this.subscriberModel.findOne({ email });
        if (!subscriber) throw new NotFoundException('Subscriber not found');
        return subscriber;
    }

    async findBySlug(email: string): Promise<Subscriber | null> {
        return this.subscriberModel.findOne({ email }).exec();
    }

    async unsubscribe(email: string): Promise<Subscriber> {
        const subscriber = await this.subscriberModel
            .findOneAndUpdate({ email }, { isSubscribed: false }, { new: true })
            .exec();
        if (!subscriber) throw new NotFoundException('Article not found');
        return subscriber;
    }
}
