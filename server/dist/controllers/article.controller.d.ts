import { ArticleService } from '../services/article.service';
import { Article } from '../models/article.model';
export declare class ArticleController {
    private readonly articleService;
    constructor(articleService: ArticleService);
    private populateDummyAuthor;
    createArticle(data: Partial<Article>): Promise<Article>;
    getAllArticles(): Promise<Article[]>;
    getArticleBySlug(category: string, slug: string): Promise<Article>;
    deleteArticle(slug: string): Promise<{
        message: string;
    }>;
}
