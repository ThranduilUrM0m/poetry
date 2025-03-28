import { Controller, Get, Post, Delete, Body, Param, NotFoundException, Put } from '@nestjs/common';
import { ArticleService } from '../services/article.service';
import { Article } from '../models/article.model';
import { dummyArticles, dummyUsers } from '../data/dummyArticles';

@Controller('api/articles')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}

    private populateDummyAuthor(article: Partial<Article>) {
        const author = dummyUsers.find(
            (user) => user._id?.toString() === article.author?.toString()
        );

        // Create a new object that will be sent to the view
        return {
            ...article,
            author: author || article.author, // Replace ObjectId with full user object
        };
    }

    @Post()
    async createArticle(@Body() data: Partial<Article>) {
        return this.articleService.createArticle(data);
    }

    @Get()
    async getAllArticles(): Promise<Article[]> {
        const articles = await this.articleService.getAllArticles();
        if (articles.length === 0) {
            return dummyArticles.map((article) => this.populateDummyAuthor(article)) as Article[];
        }
        console.log(articles);
        return articles;
    }

    @Get(':category')
    async getArticlesByCategory(@Param('category') category: string): Promise<Article[]> {
        const articles = await this.articleService.getArticleByCategory(category);
        if (articles.length === 0) {
            // Filter dummy articles by category (case-insensitive)
            const filteredDummy = dummyArticles.filter(
                (article) => article.category?.toLowerCase() === category.toLowerCase()
            );
            if (filteredDummy.length === 0) {
                throw new NotFoundException('No articles found for this category');
            }
            return filteredDummy.map((article) => this.populateDummyAuthor(article)) as Article[];
        }
        // Otherwise, return articles matching the category
        return articles;
    }

    @Get(':category/:slug')
    async getArticleBySlug(
        @Param('category') category: string,
        @Param('slug') slug: string
    ): Promise<Article> {
        const article = await this.articleService.findBySlug(category, slug);
        if (!article) {
            const dummyArticle = dummyArticles.find(
                (a) => a.category?.toLowerCase() === category.toLowerCase() && a.slug === slug
            );
            if (!dummyArticle) {
                throw new NotFoundException('Article not found');
            }
            return this.populateDummyAuthor(dummyArticle) as Article;
        }
        return article;
    }

    @Put(':slug')
    async updateArticle(@Param('slug') slug: string, @Body() data: Partial<Article>) {
        return this.articleService.updateArticle(slug, data);
    }

    @Put()
    async updateArticles(@Body() data: Partial<Article>[]) {
        return this.articleService.updateArticles(data);
    }

    @Delete(':slug')
    async deleteArticle(@Param('slug') slug: string) {
        return this.articleService.deleteArticle(slug);
    }
}
