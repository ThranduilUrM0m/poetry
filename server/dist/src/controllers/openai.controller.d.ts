import { OpenAIService, AnalyzeCommentDto, AnalyzeCommentResult, SuggestTagsDto } from '../services/openai.service';
export declare class OpenAIController {
    private readonly openai;
    constructor(openai: OpenAIService);
    analyzeComment(dto: AnalyzeCommentDto): Promise<AnalyzeCommentResult>;
    suggestTags(dto: SuggestTagsDto): Promise<string[]>;
}
