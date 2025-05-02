export declare class OpenAIController {
    private openai;
    constructor();
    analyzeComment(data: {
        text: string;
    }): Promise<{
        toxic: boolean;
        spam: boolean;
        sentiment: 'positive' | 'neutral' | 'negative';
        score: number;
        reasons: string[];
        severity: 'low' | 'medium' | 'high';
    }>;
    suggestTags(data: {
        input: string;
        content: string;
    }): Promise<string[]>;
}
