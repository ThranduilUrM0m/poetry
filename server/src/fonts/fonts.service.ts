// src/fonts/fonts.service.ts

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs'; // converts Observable to Promise
import type { AxiosResponse } from 'axios';

interface GoogleFontsResponse {
    items: { family: string }[];
}

@Injectable()
export class FontsService {
    private readonly API_URL = 'https://www.googleapis.com/webfonts/v1/webfonts';

    constructor(private readonly http: HttpService) {}

    async getFonts(): Promise<string[]> {
        const key = process.env.GOOGLE_FONTS_API_KEY;
        // 1. Fetch with typed generic
        const response: AxiosResponse<GoogleFontsResponse> = await firstValueFrom(
            this.http.get<GoogleFontsResponse>(this.API_URL, {
                params: { key, sort: 'alpha' },
            })
        );
        // 2. Now res.data is known
        return response.data.items.map((item) => item.family);
    }
}
