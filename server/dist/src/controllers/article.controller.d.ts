import { ArticleService } from '../services/article.service';
import { Article } from '../models/article.model';
export declare class ArticleController {
    private readonly articleService;
    constructor(articleService: ArticleService);
    private populateDummyAuthor;
    createArticle(data: Partial<Article>): Promise<Article>;
    getAllArticles(): Promise<Article[]>;
    getArticlesByCategory(category: string): Promise<Article[]>;
    getArticleBySlug(category: string, slug: string): Promise<Article>;
    updateArticle(slug: string, data: Partial<Article>): Promise<Article>;
    updateArticles(data: Partial<Article>[]): Promise<Article[]>;
    deleteArticle(slug: string): Promise<{
        message: string;
    }>;
}
