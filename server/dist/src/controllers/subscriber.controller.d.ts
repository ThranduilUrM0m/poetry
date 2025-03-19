import { SubscriberService } from '../services/subscriber.service';
import { Subscriber } from '../models/subscriber.model';
export declare class SubscriberController {
    private readonly subscriberService;
    constructor(subscriberService: SubscriberService);
    subscribe(email: string): Promise<{
        message: string;
    }>;
    unsubscribe(email: string): Promise<{
        message: string;
    }>;
    getAllSubscribers(): Promise<Subscriber[]>;
    getSubscriberBySlug(email: string): Promise<Subscriber>;
}
