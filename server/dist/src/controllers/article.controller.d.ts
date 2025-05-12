import { ArticleService } from '../services/article.service';
import { ArticleDocument } from '../models/article.model';
import { NotificationService } from 'src/services/notification.service';
import { NotificationGateway } from 'src/gateways/notification.gateway';
export type PopulatedArticle = ReturnType<ArticleService['populateOne']> extends Promise<infer U> ? U : never;
export declare class ArticleController {
    private readonly articleService;
    private readonly notificationService;
    private readonly notificationGateway;
    constructor(articleService: ArticleService, notificationService: NotificationService, notificationGateway: NotificationGateway);
    create(dto: Partial<ArticleDocument>): Promise<PopulatedArticle>;
    findAll(): Promise<PopulatedArticle[]>;
    findBySlug(category: string, slug: string): Promise<PopulatedArticle>;
    findByCategory(category: string): Promise<PopulatedArticle[]>;
    updateOne(idOrSlug: string, dto: Partial<ArticleDocument>): Promise<PopulatedArticle>;
    updateMany(dtos: Partial<ArticleDocument>[]): Promise<PopulatedArticle[]>;
    delete(idOrSlug: string): Promise<{
        message: string;
    }>;
    trackView(id: string, fp: string): Promise<PopulatedArticle>;
    toggleVote(id: string, body: {
        fingerprint: string;
        direction: 'up' | 'down';
    }): Promise<PopulatedArticle>;
}
