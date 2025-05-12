// notification.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from '../controllers/notification.controller';
import { NotificationService } from '../services/notification.service';
import { Notification, NotificationSchema } from '../models/notification.model';
import { NotificationGateway } from '../gateways/notification.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Notification.name, schema: NotificationSchema }
        ]),
        AuthModule,
    ],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationGateway],
    exports: [
        NotificationService,
        NotificationGateway,
        MongooseModule.forFeature([
            { name: Notification.name, schema: NotificationSchema }
        ])
    ]
})
export class NotificationModule {}