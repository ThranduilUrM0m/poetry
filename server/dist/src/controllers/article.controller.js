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
exports.ArticleController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const article_model_1 = require("../models/article.model");
const user_model_1 = require("../models/user.model");
const comment_model_1 = require("../models/comment.model");
const view_model_1 = require("../models/view.model");
const vote_model_1 = require("../models/vote.model");
const article_service_1 = require("../services/article.service");
const dummyData_1 = require("../data/dummyData");
let ArticleController = class ArticleController {
    constructor(articleService, articleModel, userModel, commentModel, viewModel, voteModel) {
        this.articleService = articleService;
        this.articleModel = articleModel;
        this.userModel = userModel;
        this.commentModel = commentModel;
        this.viewModel = viewModel;
        this.voteModel = voteModel;
    }
    async populateField(id, model, dummyData) {
        const doc = await model.findById(id).lean().exec();
        if (doc) {
            return doc;
        }
        const fallback = dummyData.find((item) => item._id.toString() === id.toString());
        if (fallback) {
            return fallback;
        }
        throw new common_1.NotFoundException(`Unable to populate field for id ${id.toString()}`);
    }
    async populateArrayField(ids, model, dummyData) {
        const results = [];
        for (const id of ids) {
            try {
                const item = await this.populateField(id, model, dummyData);
                results.push(item);
            }
            catch (error) {
                console.log(error);
            }
        }
        return results;
    }
    async populateArticle(article) {
        const populatedArticle = {
            ...article,
            author: {},
            comments: [],
            votes: [],
            views: [],
        };
        if (article.author instanceof mongoose_2.Types.ObjectId) {
            populatedArticle.author = await this.populateField(article.author, this.userModel, dummyData_1.dummyUsers);
        }
        else {
            populatedArticle.author = article.author;
        }
        if (article.comments && Array.isArray(article.comments)) {
            populatedArticle.comments = await this.populateArrayField(article.comments, this.commentModel, dummyData_1.dummyComments);
        }
        if (article.votes && Array.isArray(article.votes)) {
            populatedArticle.votes = await this.populateArrayField(article.votes, this.voteModel, dummyData_1.dummyVotes);
        }
        if (article.views && Array.isArray(article.views)) {
            populatedArticle.views = await this.populateArrayField(article.views, this.viewModel, dummyData_1.dummyViews);
        }
        return populatedArticle;
    }
    async createArticle(data) {
        return this.articleService.createArticle(data);
    }
    async getAllArticles() {
        const articlesFromDb = await this.articleService.getAllArticles();
        if (articlesFromDb.length > 0) {
            return Promise.all(articlesFromDb.map((article) => this.populateArticle(article)));
        }
        else {
            return Promise.all(dummyData_1.dummyArticles.map(async (article) => this.populateArticle(article)));
        }
    }
    async getArticlesByCategory(category) {
        const articlesFromDb = await this.articleService.getArticleByCategory(category);
        if (articlesFromDb.length > 0) {
            return Promise.all(articlesFromDb.map((article) => this.populateArticle(article)));
        }
        const filteredDummy = dummyData_1.dummyArticles.filter((article) => article.category?.toLowerCase() === category.toLowerCase());
        if (filteredDummy.length === 0) {
            throw new common_1.NotFoundException('No articles found for this category');
        }
        return Promise.all(filteredDummy.map(async (article) => this.populateArticle(article)));
    }
    async getArticleBySlug(category, slug) {
        const articleFromDb = await this.articleService.findBySlug(category, slug);
        if (articleFromDb) {
            return this.populateArticle(articleFromDb);
        }
        const dummyArticle = dummyData_1.dummyArticles.find((a) => a.category?.toLowerCase() === category.toLowerCase() && a.slug === slug);
        if (!dummyArticle) {
            throw new common_1.NotFoundException('Article not found');
        }
        return this.populateArticle(dummyArticle);
    }
    async updateArticle(slug, data) {
        const updated = await this.articleService.updateArticle(slug, data);
        return this.populateArticle(updated);
    }
    async updateArticles(data) {
        const updatedArticles = await this.articleService.updateArticles(data);
        return Promise.all(updatedArticles.map((article) => this.populateArticle(article)));
    }
    async deleteArticle(slug) {
        return this.articleService.deleteArticle(slug);
    }
    async trackView(id, body) {
        try {
            const exists = await this.articleModel
                .exists({ _id: id, 'views._viewer': body.fingerprint })
                .lean()
                .exec();
            if (!exists) {
                const view = await this.viewModel.create({
                    _viewer: body.fingerprint,
                    article: new mongoose_2.Types.ObjectId(id),
                });
                const updatedArticle = await this.articleModel
                    .findByIdAndUpdate(new mongoose_2.Types.ObjectId(id), { $push: { views: view._id } }, { new: true, lean: true })
                    .exec();
                if (!updatedArticle) {
                    const dummyArticle = dummyData_1.dummyArticles.find((a) => a._id?.toString() === id);
                    if (dummyArticle) {
                        return this.populateArticle(dummyArticle);
                    }
                    throw new common_1.NotFoundException('Article not found');
                }
                return this.populateArticle(updatedArticle);
            }
            const article = await this.articleModel.findById(id).lean().exec();
            if (!article) {
                const dummyArticle = dummyData_1.dummyArticles.find((a) => a._id?.toString() === id);
                if (dummyArticle) {
                    return this.populateArticle(dummyArticle);
                }
                throw new common_1.NotFoundException('Article not found');
            }
            return this.populateArticle(article);
        }
        catch (error) {
            console.error(error);
            throw new common_1.HttpException('Failed to track view', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async vote(id, body) {
        return this.toggleVote(id, body.fingerprint, body.direction);
    }
    async toggleVote(id, fingerprint, direction) {
        try {
            const article = await this.articleModel.findById(id).lean().exec();
            if (!article) {
                const dummyArticle = dummyData_1.dummyArticles.find((a) => a._id?.toString() === id);
                if (dummyArticle) {
                    const existingDummyVote = dummyData_1.dummyVotes.find((vote) => vote.target?.toString() === id && vote.voter === fingerprint);
                    if (existingDummyVote) {
                        console.log('Vote exists in dummy data, no changes will be made.');
                        return this.populateArticle(dummyArticle);
                    }
                    await this.voteModel.create({
                        voter: fingerprint,
                        targetType: 'Article',
                        target: new mongoose_2.Types.ObjectId(id),
                        direction,
                    });
                    return this.populateArticle(dummyArticle);
                }
                throw new common_1.NotFoundException('Article not found');
            }
            const existingVote = await this.voteModel
                .findOne({ target: new mongoose_2.Types.ObjectId(id), voter: fingerprint })
                .exec();
            let update;
            if (existingVote) {
                if (existingVote.direction === direction) {
                    await this.voteModel.findByIdAndDelete(existingVote._id).exec();
                    update = { $pull: { votes: existingVote._id } };
                }
                else {
                    await this.voteModel.findByIdAndDelete(existingVote._id).exec();
                    update = { $pull: { votes: existingVote._id } };
                    const newVote = await this.voteModel.create({
                        voter: fingerprint,
                        targetType: 'Article',
                        target: new mongoose_2.Types.ObjectId(id),
                        direction,
                    });
                    update = { $push: { votes: newVote._id } };
                }
            }
            else {
                const newVote = await this.voteModel.create({
                    voter: fingerprint,
                    targetType: 'Article',
                    target: new mongoose_2.Types.ObjectId(id),
                    direction,
                });
                update = { $push: { votes: newVote._id } };
            }
            const updatedArticle = await this.articleModel
                .findByIdAndUpdate(new mongoose_2.Types.ObjectId(id), update, { new: true, lean: true })
                .exec();
            if (!updatedArticle) {
                throw new common_1.NotFoundException('Article not found after update');
            }
            return this.populateArticle(updatedArticle);
        }
        catch (error) {
            console.error(error);
            throw new common_1.HttpException('Failed to process vote', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ArticleController = ArticleController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "createArticle", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "getAllArticles", null);
__decorate([
    (0, common_1.Get)(':category'),
    __param(0, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "getArticlesByCategory", null);
__decorate([
    (0, common_1.Get)(':category/:slug'),
    __param(0, (0, common_1.Param)('category')),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "getArticleBySlug", null);
__decorate([
    (0, common_1.Put)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "updateArticle", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "updateArticles", null);
__decorate([
    (0, common_1.Delete)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "deleteArticle", null);
__decorate([
    (0, common_1.Post)(':id/views'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "trackView", null);
__decorate([
    (0, common_1.Post)(':id/vote'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "vote", null);
exports.ArticleController = ArticleController = __decorate([
    (0, common_1.Controller)('api/articles'),
    __param(1, (0, mongoose_1.InjectModel)(article_model_1.Article.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_model_1.User.name)),
    __param(3, (0, mongoose_1.InjectModel)(comment_model_1.Comment.name)),
    __param(4, (0, mongoose_1.InjectModel)(view_model_1.View.name)),
    __param(5, (0, mongoose_1.InjectModel)(vote_model_1.Vote.name)),
    __metadata("design:paramtypes", [article_service_1.ArticleService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ArticleController);
//# sourceMappingURL=article.controller.js.map