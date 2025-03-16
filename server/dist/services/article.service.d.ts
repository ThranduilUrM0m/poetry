import { Model } from 'mongoose';
import { Article, ArticleDocument } from '../models/article.model';
export declare class ArticleService {
    private articleModel;
    constructor(articleModel: Model<ArticleDocument>);
    createArticle(data: Partial<Article>): Promise<Article>;
    getAllArticles(): Promise<Article[]>;
    getArticleBySlug(slug: string): Promise<Article>;
    findBySlug(category: string, slug: string): Promise<Article | null>;
    deleteArticle(slug: string): Promise<{
        message: string;
    }>;
    updateArticle(slug: string, data: Partial<Article>): Promise<Article>;
    updateArticles(data: Partial<Article>[]): Promise<Article[]>;
}
