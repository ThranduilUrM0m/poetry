import { SubscriberService } from '../services/subscriber.service';
import { Subscriber } from '../models/subscriber.model';
import { NotificationService } from '../services/notification.service';
import { NotificationGateway } from '../gateways/notification.gateway';
export declare class SubscriberController {
    private readonly subscriberService;
    private readonly notificationService;
    private readonly notificationGateway;
    constructor(subscriberService: SubscriberService, notificationService: NotificationService, notificationGateway: NotificationGateway);
    subscribe(email: string): Promise<{
        message: string;
    }>;
    unsubscribe(email: string): Promise<{
        message: string;
    }>;
    getAll(): Promise<Subscriber[]>;
    getOne(email: string): Promise<Subscriber>;
}
