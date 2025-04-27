import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import OpenAI from 'openai';

@Controller('api/analyze-comment')
export class OpenAIController {
    private openai: OpenAI;

    constructor() {
        try {
            console.log(
                'Initializing OpenAI with API key:',
                process.env.OPENAI_API_KEY ? 'Present' : 'Missing'
            );
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
        } catch (error) {
            console.error('Failed to initialize OpenAI:', error);
            throw new Error('OpenAI initialization failed');
        }
    }

    @Post()
    async analyzeComment(@Body() data: { text: string }): Promise<{
        toxic: boolean;
        spam: boolean;
        sentiment: 'positive' | 'neutral' | 'negative';
        score: number;
        reasons: string[];
        severity: 'low' | 'medium' | 'high';
    }> {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are a content moderator. Analyze the following comment and respond with a JSON object.
                        
                        Severity levels should be determined as follows:
                        - "high": Direct hate speech, slurs, extreme profanity, explicit threats
                        - "medium": Personal attacks, offensive language, discriminatory terms
                        - "low": Mild negativity, subtle rudeness, potentially unwelcoming language
                        
                        For toxic content:
                        1. Check for hate speech, slurs, and discriminatory language (high severity)
                        2. Identify personal attacks or harassment (medium/high severity)
                        3. Look for offensive language or profanity (medium severity)
                        4. Check for subtle forms of unwelcoming behavior (low severity)
                        
                        The response JSON should contain:
                        {
                            "toxic": boolean,
                            "spam": boolean,
                            "sentiment": "positive" | "neutral" | "negative",
                            "score": number (0-1, higher = more problematic),
                            "severity": "low" | "medium" | "high",
                            "reasons": string[] (specific issues found)
                        }`,
                    },
                    {
                        role: 'user',
                        content: data.text,
                    },
                ],
                temperature: 0,
                response_format: { type: 'json_object' },
            });

            const raw = response.choices[0]?.message?.content || '{}';

            const analysis = JSON.parse(raw);

            const result = {
                toxic: analysis.toxic ?? false,
                spam: analysis.spam ?? false,
                sentiment: analysis.sentiment ?? 'neutral',
                score: analysis.score ?? 0.5,
                severity: analysis.severity ?? 'low',
                reasons: analysis.reasons ?? [],
            };

            return result;
        } catch (error) {
            console.error('OpenAI Analysis Error:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                response: error.response?.data,
            });

            if (error instanceof SyntaxError) {
                console.error('JSON Parse Error:', error);
                throw new HttpException(
                    'Invalid response format',
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }

            if (error.response?.status === 429) {
                throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
            }

            throw new HttpException(
                `Failed to analyze comment: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
