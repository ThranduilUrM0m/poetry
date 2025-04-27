"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const article_model_1 = require("../models/article.model");
let ArticleService = class ArticleService {
    constructor(articleModel) {
        this.articleModel = articleModel;
    }
    async createArticle(data) {
        const newArticle = new this.articleModel(data);
        return newArticle.save();
    }
    async getAllArticles() {
        const articles = await this.articleModel.aggregate([
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
                            else: '$author',
                        },
                    },
                },
            },
            { $project: { authorLookup: 0 } },
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
                                                    '$$foundVote',
                                                    null,
                                                ],
                                            },
                                            '$$voteId',
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
        return articles;
    }
    async getArticleBySlug(slug) {
        const [article] = await this.articleModel.aggregate([
            { $match: { slug } },
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
                            else: '$author',
                        },
                    },
                },
            },
            { $project: { authorLookup: 0 } },
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
                                                    '$$foundVote',
                                                    null,
                                                ],
                                            },
                                            '$$voteId',
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
        if (!article)
            throw new common_1.NotFoundException('Article not found');
        return article;
    }
    async getArticleByCategory(category) {
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
                            else: '$author',
                        },
                    },
                },
            },
            { $project: { authorLookup: 0 } },
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
                                                    '$$foundVote',
                                                    null,
                                                ],
                                            },
                                            '$$voteId',
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
        if (!articles)
            throw new common_1.NotFoundException('Article not found');
        return articles;
    }
    async findBySlug(category, slug) {
        const [article] = await this.articleModel.aggregate([
            {
                $match: {
                    slug,
                    category: {
                        $regex: `^${category}$`,
                        $options: 'i',
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
                            else: '$author',
                        },
                    },
                },
            },
            { $project: { authorLookup: 0 } },
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
                                                    '$$foundVote',
                                                    null,
                                                ],
                                            },
                                            '$$voteId',
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
        if (!article)
            throw new common_1.NotFoundException('Article not found');
        return article;
    }
    async deleteArticle(slug) {
        const article = await this.articleModel.findOneAndDelete({ slug });
        if (!article)
            throw new common_1.NotFoundException('Article not found');
        return { message: 'Article deleted successfully' };
    }
    async updateArticle(slug, data) {
        const article = await this.articleModel.findOneAndUpdate({ slug }, data, { new: true });
        if (!article)
            throw new common_1.NotFoundException('Article not found');
        return article;
    }
    async updateArticles(data) {
        const updatedArticles = [];
        for (const articleData of data) {
            const article = await this.articleModel.findOneAndUpdate({ slug: articleData.slug }, articleData, { new: true });
            if (article)
                updatedArticles.push(article);
        }
        return updatedArticles;
    }
};
exports.ArticleService = ArticleService;
exports.ArticleService = ArticleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(article_model_1.Article.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ArticleService);
//# sourceMappingURL=article.service.js.map