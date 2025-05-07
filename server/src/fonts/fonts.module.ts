import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'
import { FontsService } from './fonts.service';
import { FontsController } from './fonts.controller';

@Module({
    imports: [HttpModule],
    providers: [FontsService],
    controllers: [FontsController],
})
export class FontsModule {}
