// src/controllers/openai.controller.ts

import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import {
    OpenAIService,
    AnalyzeCommentDto,
    AnalyzeCommentResult,
    SuggestTagsDto,
} from '../services/openai.service';

@Controller('api/analyze-comment')
export class OpenAIController {
    constructor(private readonly openai: OpenAIService) {}

    /**
     * POST /api/analyze-comment
     */
    @Post()
    async analyzeComment(@Body() dto: AnalyzeCommentDto): Promise<AnalyzeCommentResult> {
        if (!dto.text || typeof dto.text !== 'string') {
            throw new HttpException('Invalid payload: text is required', HttpStatus.BAD_REQUEST);
        }
        return this.openai.analyzeComment(dto);
    }

    /**
     * POST /api/analyze-comment/suggest-tags
     */
    @Post('suggest-tags')
    async suggestTags(@Body() dto: SuggestTagsDto): Promise<string[]> {
        if (
            !dto.input ||
            !dto.content ||
            typeof dto.input !== 'string' ||
            typeof dto.content !== 'string'
        ) {
            throw new HttpException(
                'Invalid payload: input and content are required',
                HttpStatus.BAD_REQUEST
            );
        }
        return this.openai.suggestTags(dto);
    }
}
