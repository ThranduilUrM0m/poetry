import { HttpService } from '@nestjs/axios';
export declare class FontsService {
    private readonly http;
    private readonly API_URL;
    constructor(http: HttpService);
    getFonts(): Promise<string[]>;
}
