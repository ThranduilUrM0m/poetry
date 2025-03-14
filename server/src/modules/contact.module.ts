import { Module } from '@nestjs/common';
import { ContactController } from '../controllers/contact.controller';

@Module({
    controllers: [ContactController],
})
export class ContactModule {}
