export interface AnalyzeCommentDto {
    text: string;
}
export interface AnalyzeCommentResult {
    toxic: boolean;
    spam: boolean;
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
    severity: 'low' | 'medium' | 'high';
    reasons: string[];
}
export interface SuggestTagsDto {
    input: string;
    content: string;
}
export declare class OpenAIService {
    private readonly openai;
    constructor();
    analyzeComment(dto: AnalyzeCommentDto): Promise<AnalyzeCommentResult>;
    suggestTags(dto: SuggestTagsDto): Promise<string[]>;
}
