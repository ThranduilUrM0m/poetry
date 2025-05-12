// contact.module.ts (new file needed)
import { Module } from '@nestjs/common';
import { ContactController, MailService } from '../controllers/contact.controller';
import { NotificationModule } from './notification.module';

@Module({
    imports: [NotificationModule],
    controllers: [ContactController],
    providers: [MailService],
})
export class ContactModule {}
