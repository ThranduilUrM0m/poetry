import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from '../models/article.model';

@Injectable()
export class ArticleService {
    constructor(@InjectModel(Article.name) private articleModel: Model<ArticleDocument>) {}

    async createArticle(data: Partial<Article>): Promise<Article> {
        const newArticle = new this.articleModel(data);
        return newArticle.save();
    }

    async getAllArticles(): Promise<Article[]> {
        const articles = await this.articleModel
            .find()
            .populate('author')
            .populate({
                path: 'votes',
                match: { targetType: 'Article' },
            })
            .lean()
            .exec();
        return articles;
    }

    async getArticleBySlug(slug: string): Promise<Article> {
        const article = await this.articleModel
            .findOne({ slug })
            .populate('author')
            .populate({
                path: 'votes',
                match: { targetType: 'Article' },
            })
            .lean()
            .exec();
        if (!article) throw new NotFoundException('Article not found');
        return article;
    }

    async getArticleByCategory(category: string): Promise<Article[]> {
        const articles = await this.articleModel
            .find({ category: category })
            .populate('author')
            .populate({
                path: 'votes',
                match: { targetType: 'Article' },
            })
            .lean()
            .exec();
        if (!articles) throw new NotFoundException('Article not found');
        return articles;
    }

    async findBySlug(category: string, slug: string): Promise<Article | null> {
        return this.articleModel
            .findOne({ category: new RegExp(`^${category}$`, 'i'), slug })
            .populate('author')
            .populate({
                path: 'votes',
                match: { targetType: 'Article' },
            })
            .lean()
            .exec();
    }

    async deleteArticle(slug: string): Promise<{ message: string }> {
        const article = await this.articleModel.findOneAndDelete({ slug });
        if (!article) throw new NotFoundException('Article not found');
        return { message: 'Article deleted successfully' };
    }

    async updateArticle(slug: string, data: Partial<Article>): Promise<Article> {
        const article = await this.articleModel.findOneAndUpdate({ slug }, data, { new: true });
        if (!article) throw new NotFoundException('Article not found');
        return article;
    }

    async updateArticles(data: Partial<Article>[]): Promise<Article[]> {
        const updatedArticles: Article[] = [];
        for (const articleData of data) {
            const article = await this.articleModel.findOneAndUpdate(
                { slug: articleData.slug },
                articleData,
                { new: true }
            );
            if (article) updatedArticles.push(article);
        }
        return updatedArticles;
    }
}
