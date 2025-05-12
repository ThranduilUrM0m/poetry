"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("openai");
let OpenAIService = class OpenAIService {
    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new common_1.HttpException('Missing OPENAI_API_KEY environment variable', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        this.openai = new openai_1.default({ apiKey });
    }
    async analyzeComment(dto) {
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
        }
        catch (err) {
            if (err instanceof SyntaxError) {
                throw new common_1.HttpException('Invalid JSON from OpenAI', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            if (err?.response?.status === 429) {
                throw new common_1.HttpException('OpenAI rate limit exceeded', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            throw new common_1.HttpException(`OpenAI analysis failed: ${err.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async suggestTags(dto) {
        try {
            const resp = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You suggest relevant tags for technical & creative articles. Return ONLY a JSON array of lowercase, hyphenated tags.',
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
            if (Array.isArray(parsed.tags)) {
                return parsed.tags.map((t) => String(t));
            }
            return [];
        }
        catch (err) {
            throw new common_1.HttpException(`OpenAI tag suggestion failed: ${err.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.OpenAIService = OpenAIService;
exports.OpenAIService = OpenAIService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], OpenAIService);
//# sourceMappingURL=openai.service.js.map