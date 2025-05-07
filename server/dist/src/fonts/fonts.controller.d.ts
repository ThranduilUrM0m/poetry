import { FontsService } from './fonts.service';
export declare class FontsController {
    private readonly fontsService;
    constructor(fontsService: FontsService);
    list(): Promise<string[]>;
}
