import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriberController } from '../controllers/subscriber.controller';
import { SubscriberService } from '../services/subscriber.service';
import { Subscriber, SubscriberSchema } from '../models/subscriber.model';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Subscriber.name, schema: SubscriberSchema }]), // Register the Subscriber model
    ],
    controllers: [SubscriberController],
    providers: [SubscriberService],
})
export class SubscriberModule {}
