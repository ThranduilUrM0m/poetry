import { Model } from 'mongoose';
import { Subscriber, SubscriberDocument } from '../models/subscriber.model';
export declare class SubscriberService {
    private subscriberModel;
    constructor(subscriberModel: Model<SubscriberDocument>);
    ensureTestData(): Promise<void>;
    subscribe(email: string): Promise<Subscriber>;
    getAllSubscribers(): Promise<Subscriber[]>;
    getSubscriberBySlug(email: string): Promise<Subscriber>;
    findBySlug(email: string): Promise<Subscriber | null>;
    unsubscribe(email: string): Promise<Subscriber>;
}
