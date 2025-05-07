import { Controller, Get } from '@nestjs/common';
import { FontsService } from './fonts.service';

@Controller('fonts')
export class FontsController {
    constructor(private readonly fontsService: FontsService) {}

    @Get()
    async list(): Promise<string[]> {
        // Directly await the Promise<string[]>
        return this.fontsService.getFonts();
    }
}
