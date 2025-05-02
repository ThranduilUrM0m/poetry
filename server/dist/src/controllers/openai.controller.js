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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIController = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("openai");
let OpenAIController = class OpenAIController {
    constructor() {
        try {
            console.log('Initializing OpenAI with API key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
            this.openai = new openai_1.default({
                apiKey: process.env.OPENAI_API_KEY,
            });
        }
        catch (error) {
            console.error('Failed to initialize OpenAI:', error);
            throw new Error('OpenAI initialization failed');
        }
    }
    async analyzeComment(data) {
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
        }
        catch (error) {
            console.error('OpenAI Analysis Error:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                response: error.response?.data,
            });
            if (error instanceof SyntaxError) {
                console.error('JSON Parse Error:', error);
                throw new common_1.HttpException('Invalid response format', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            if (error.response?.status === 429) {
                throw new common_1.HttpException('Rate limit exceeded', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            throw new common_1.HttpException(`Failed to analyze comment: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async suggestTags(data) {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that suggests relevant tags for technical and creative articles. ' +
                            'Return only a JSON array of lowercase, hyphenated tag strings.',
                    },
                    {
                        role: 'user',
                        content: `Based on the title "${data.input}" and body of length ${data.content.length}, ` +
                            'suggest 5–10 concise, hyphenated tags for a poetry blog.',
                    },
                ],
                temperature: 0.6,
                max_tokens: 100,
                response_format: { type: 'json_object' },
            });
            const payload = JSON.parse(response.choices[0]?.message?.content || '[]');
            const suggestions = Array.isArray(payload)
                ? payload
                : Array.isArray(payload.tags)
                    ? payload.tags
                    : [];
            return suggestions;
        }
        catch (error) {
            console.error('OpenAI tag suggestion error:', error);
            throw new common_1.HttpException('Tag suggestion failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.OpenAIController = OpenAIController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OpenAIController.prototype, "analyzeComment", null);
__decorate([
    (0, common_1.Post)('suggest-tags'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OpenAIController.prototype, "suggestTags", null);
exports.OpenAIController = OpenAIController = __decorate([
    (0, common_1.Controller)('api/analyze-comment'),
    __metadata("design:paramtypes", [])
], OpenAIController);
//# sourceMappingURL=openai.controller.js.map