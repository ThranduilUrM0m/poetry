// subscriber.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriberController } from '../controllers/subscriber.controller';
import { SubscriberService } from '../services/subscriber.service';
import { Subscriber, SubscriberSchema } from '../models/subscriber.model';
import { NotificationModule } from './notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscriber.name, schema: SubscriberSchema },
    ]),
    NotificationModule,
  ],
  controllers: [SubscriberController],
  providers: [SubscriberService],
  exports: [SubscriberService],
})
export class SubscriberModule {}