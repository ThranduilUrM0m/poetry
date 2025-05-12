import { Model } from 'mongoose';
import { Subscriber, SubscriberDocument } from '../models/subscriber.model';
export declare class SubscriberService {
    private readonly subscriberModel;
    constructor(subscriberModel: Model<SubscriberDocument>);
    ensureTestData(): Promise<void>;
    subscribe(email: string): Promise<Subscriber>;
    unsubscribe(email: string): Promise<Subscriber>;
    getAllSubscribers(): Promise<Subscriber[]>;
    findByEmail(email: string): Promise<Subscriber | null>;
}
