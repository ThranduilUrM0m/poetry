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
        const articles = await this.articleModel.find().populate('author');
        return articles;
    }

    async getArticleBySlug(slug: string): Promise<Article> {
        const article = await this.articleModel.findOne({ slug }).populate('author');
        if (!article) throw new NotFoundException('Article not found');
        return article;
    }

    async findBySlug(category: string, slug: string): Promise<Article | null> {
        return this.articleModel.findOne({ category, slug }).exec();
    }

    async deleteArticle(slug: string): Promise<{ message: string }> {
        const article = await this.articleModel.findOneAndDelete({ slug });
        if (!article) throw new NotFoundException('Article not found');
        return { message: 'Article deleted successfully' };
    }
}
