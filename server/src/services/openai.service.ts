// src/services/openai.service.ts

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import OpenAI from 'openai';

export interface AnalyzeCommentDto {
    text: string;
}

export interface AnalyzeCommentResult {
    toxic: boolean;
    spam: boolean;
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number; // 0–1, higher = more problematic
    severity: 'low' | 'medium' | 'high';
    reasons: string[];
}

export interface SuggestTagsDto {
    input: string; // e.g. title
    content: string; // e.g. body text
}

@Injectable()
export class OpenAIService {
    private readonly openai: OpenAI;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new HttpException(
                'Missing OPENAI_API_KEY environment variable',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        this.openai = new OpenAI({ apiKey });
    }

    /**
     * Analyze toxicity, spam, sentiment, severity, and reasons for a comment.
     */
    async analyzeComment(dto: AnalyzeCommentDto): Promise<AnalyzeCommentResult> {
        try {
            const resp = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `
You are a content moderator. Analyze the following comment and respond with a JSON object exactly matching:
{
  "toxic": boolean,
  "spam": boolean,
  "sentiment": "positive" | "neutral" | "negative",
  "score": number,
  "severity": "low" | "medium" | "high",
  "reasons": string[]
}
Severity levels:
- high: direct hate speech, slurs, threats
- medium: personal attacks, strong profanity
- low: mild negativity or rudeness
            `.trim(),
                    },
                    { role: 'user', content: dto.text },
                ],
                temperature: 0,
                response_format: { type: 'json_object' },
            });

            const raw = resp.choices?.[0]?.message?.content ?? '{}';
            const parsed = JSON.parse(raw);

            return {
                toxic: parsed.toxic ?? false,
                spam: parsed.spam ?? false,
                sentiment: parsed.sentiment ?? 'neutral',
                score: typeof parsed.score === 'number' ? parsed.score : 0,
                severity: parsed.severity ?? 'low',
                reasons: Array.isArray(parsed.reasons) ? parsed.reasons.map(String) : [],
            };
        } catch (err: any) {
            if (err instanceof SyntaxError) {
                throw new HttpException(
                    'Invalid JSON from OpenAI',
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
            if (err?.response?.status === 429) {
                throw new HttpException('OpenAI rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
            }
            throw new HttpException(
                `OpenAI analysis failed: ${err.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Suggest 5–10 concise, hyphenated tags based on title and content.
     */
    async suggestTags(dto: SuggestTagsDto): Promise<string[]> {
        try {
            const resp = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content:
                            'You suggest relevant tags for technical & creative articles. Return ONLY a JSON array of lowercase, hyphenated tags.',
                    },
                    {
                        role: 'user',
                        content: `Title: "${dto.input}"\nContent length: ${dto.content.length}`,
                    },
                ],
                temperature: 0.6,
                max_tokens: 100,
                response_format: { type: 'json_object' },
            });

            const raw = resp.choices?.[0]?.message?.content ?? '[]';
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed.map((t) => String(t));
            }
            if (Array.isArray((parsed as any).tags)) {
                return (parsed as any).tags.map((t: any) => String(t));
            }
            return [];
        } catch (err: any) {
            throw new HttpException(
                `OpenAI tag suggestion failed: ${err.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
