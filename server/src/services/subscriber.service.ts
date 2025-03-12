import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscriber, SubscriberDocument } from '../models/subscriber.model';

@Injectable()
export class SubscriberService {
    constructor(@InjectModel(Subscriber.name) private subscriberModel: Model<SubscriberDocument>) {}

    async subscribe(email: string): Promise<Subscriber> {
        const existingSubscriber = await this.subscriberModel.findOne({ email }).exec();
        if (existingSubscriber) {
            throw new Error('Email already subscribed');
        }
        const subscriber = new this.subscriberModel({ email });
        return subscriber.save();
    }

    async getAllSubscribers(): Promise<Subscriber[]> {
        return this.subscriberModel.find();
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
