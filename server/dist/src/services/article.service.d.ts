import { Model } from 'mongoose';
import { Article, ArticleDocument } from '../models/article.model';
export declare class ArticleService {
    private articleModel;
    constructor(articleModel: Model<ArticleDocument>);
    createArticle(data: Partial<Article>): Promise<Article>;
    getAllArticles(): Promise<Article[]>;
    getArticleBySlug(slug: string): Promise<Article>;
    getArticleByCategory(category: string): Promise<Article[]>;
    findBySlug(category: string, slug: string): Promise<Article | null>;
    updateArticleById(id: string, data: Partial<Article>): Promise<Article>;
    updateArticleBySlug(slug: string, data: Partial<Article>): Promise<Article>;
    updateArticles(data: Partial<Article>[]): Promise<Article[]>;
    deleteArticleById(id: string): Promise<void>;
    deleteArticleBySlug(slug: string): Promise<void>;
}
