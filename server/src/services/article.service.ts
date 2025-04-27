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
        const articles = await this.articleModel.aggregate([
            // Handle 'author' population
            {
                $lookup: {
                    from: 'users', // Collection name for authors
                    localField: 'author',
                    foreignField: '_id',
                    as: 'authorLookup',
                },
            },
            {
                $addFields: {
                    author: {
                        $cond: {
                            // Check if lookup found results
                            if: { $gt: [{ $size: '$authorLookup' }, 0] },
                            // If found, use the document
                            then: { $arrayElemAt: ['$authorLookup', 0] },
                            // If not found, retain original ObjectId
                            else: '$author',
                        },
                    },
                },
            },
            { $project: { authorLookup: 0 } }, // Remove temporary field

            // Handle 'votes' population with targetType filtering
            {
                $lookup: {
                    from: 'votes', // Collection name for votes
                    localField: 'votes',
                    foreignField: '_id',
                    as: 'votesLookup',
                },
            },
            {
                $addFields: {
                    votes: {
                        $map: {
                            input: '$votes', // Original votes array
                            as: 'voteId',
                            in: {
                                $let: {
                                    vars: {
                                        // Find corresponding vote document
                                        foundVote: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$votesLookup',
                                                        cond: { $eq: ['$$this._id', '$$voteId'] },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                    in: {
                                        $cond: [
                                            { $ne: ['$$foundVote', null] }, // If vote exists
                                            {
                                                // Check targetType condition
                                                $cond: [
                                                    { $eq: ['$$foundVote.targetType', 'Article'] },
                                                    '$$foundVote', // Keep if matches
                                                    null, // Set to null if type mismatch
                                                ],
                                            },
                                            '$$voteId', // Retain original ID if vote doesn't exist
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
            },
            { $project: { votesLookup: 0 } }, // Remove temporary field
        ]);
        return articles;
    }

    async getArticleBySlug(slug: string): Promise<Article> {
        const [article] = await this.articleModel.aggregate([
            { $match: { slug } },
            // Author population
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'authorLookup',
                },
            },
            {
                $addFields: {
                    author: {
                        $cond: {
                            if: { $gt: [{ $size: '$authorLookup' }, 0] },
                            then: { $arrayElemAt: ['$authorLookup', 0] },
                            else: '$author', // Keep original ID
                        },
                    },
                },
            },
            { $project: { authorLookup: 0 } },
            // Votes population with targetType filter
            {
                $lookup: {
                    from: 'votes',
                    localField: 'votes',
                    foreignField: '_id',
                    as: 'votesLookup',
                },
            },
            {
                $addFields: {
                    votes: {
                        $map: {
                            input: '$votes',
                            as: 'voteId',
                            in: {
                                $let: {
                                    vars: {
                                        foundVote: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$votesLookup',
                                                        cond: { $eq: ['$$this._id', '$$voteId'] },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                    in: {
                                        $cond: [
                                            { $ne: ['$$foundVote', null] },
                                            {
                                                $cond: [
                                                    { $eq: ['$$foundVote.targetType', 'Article'] },
                                                    '$$foundVote', // Keep if type matches
                                                    null, // Null if type mismatch
                                                ],
                                            },
                                            '$$voteId', // Keep ID if vote not found
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
            },
            { $project: { votesLookup: 0 } },
            { $limit: 1 }, // Simulate findOne()
        ]);
        if (!article) throw new NotFoundException('Article not found');
        return article;
    }

    async getArticleByCategory(category: string): Promise<Article[]> {
        const articles = await this.articleModel.aggregate([
            { $match: { category } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'authorLookup',
                },
            },
            {
                $addFields: {
                    author: {
                        $cond: {
                            if: { $gt: [{ $size: '$authorLookup' }, 0] },
                            then: { $arrayElemAt: ['$authorLookup', 0] },
                            else: '$author', // Keep original ID
                        },
                    },
                },
            },
            { $project: { authorLookup: 0 } },
            // Votes population with targetType filter
            {
                $lookup: {
                    from: 'votes',
                    localField: 'votes',
                    foreignField: '_id',
                    as: 'votesLookup',
                },
            },
            {
                $addFields: {
                    votes: {
                        $map: {
                            input: '$votes',
                            as: 'voteId',
                            in: {
                                $let: {
                                    vars: {
                                        foundVote: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$votesLookup',
                                                        cond: { $eq: ['$$this._id', '$$voteId'] },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                    in: {
                                        $cond: [
                                            { $ne: ['$$foundVote', null] },
                                            {
                                                $cond: [
                                                    { $eq: ['$$foundVote.targetType', 'Article'] },
                                                    '$$foundVote', // Keep if type matches
                                                    null, // Null if type mismatch
                                                ],
                                            },
                                            '$$voteId', // Keep ID if vote not found
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
            },
            { $project: { votesLookup: 0 } },
        ]);
        if (!articles) throw new NotFoundException('Article not found');
        return articles;
    }

    async findBySlug(category: string, slug: string): Promise<Article | null> {
        const [article] = await this.articleModel.aggregate([
            {
                $match: {
                    slug,
                    category: {
                        $regex: `^${category}$`,
                        $options: 'i', // Case-insensitive
                    },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'authorLookup',
                },
            },
            {
                $addFields: {
                    author: {
                        $cond: {
                            if: { $gt: [{ $size: '$authorLookup' }, 0] },
                            then: { $arrayElemAt: ['$authorLookup', 0] },
                            else: '$author', // Keep original ID
                        },
                    },
                },
            },
            { $project: { authorLookup: 0 } },
            // Votes population with targetType filter
            {
                $lookup: {
                    from: 'votes',
                    localField: 'votes',
                    foreignField: '_id',
                    as: 'votesLookup',
                },
            },
            {
                $addFields: {
                    votes: {
                        $map: {
                            input: '$votes',
                            as: 'voteId',
                            in: {
                                $let: {
                                    vars: {
                                        foundVote: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$votesLookup',
                                                        cond: { $eq: ['$$this._id', '$$voteId'] },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                    in: {
                                        $cond: [
                                            { $ne: ['$$foundVote', null] },
                                            {
                                                $cond: [
                                                    { $eq: ['$$foundVote.targetType', 'Article'] },
                                                    '$$foundVote', // Keep if type matches
                                                    null, // Null if type mismatch
                                                ],
                                            },
                                            '$$voteId', // Keep ID if vote not found
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
            },
            { $project: { votesLookup: 0 } },
            { $limit: 1 },
        ]);
        if (!article) throw new NotFoundException('Article not found');
        return article;
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
