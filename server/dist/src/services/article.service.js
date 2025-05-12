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
const dummyData_1 = require("../data/dummyData");
const ARTICLES_FALLBACK = dummyData_1.dummyArticles;
let ArticleService = class ArticleService {
    constructor(articleModel, userModel, commentModel, voteModel, viewModel) {
        this.articleModel = articleModel;
        this.userModel = userModel;
        this.commentModel = commentModel;
        this.voteModel = voteModel;
        this.viewModel = viewModel;
    }
    async findWithFallback(filter) {
        const real = await this.articleModel.find(filter).lean().exec();
        return real.length > 0 ? real : ARTICLES_FALLBACK;
    }
    async findOneWithFallback(filter, isId = false) {
        let doc = null;
        if (isId) {
            if (!(0, mongoose_2.isObjectIdOrHexString)(filter)) {
                throw new common_1.BadRequestException(`Invalid Article ID "${filter}"`);
            }
            doc = await this.articleModel
                .findById(filter)
                .lean()
                .exec();
        }
        else {
            doc = await this.articleModel
                .findOne(filter)
                .lean()
                .exec();
        }
        if (doc) {
            return doc;
        }
        let fallback = dummyData_1.dummyArticles.find((a) => {
            if (isId) {
                return a._id && a._id.toString() === filter;
            }
            return Object.entries(filter).every(([k, val]) => String(a[k] ?? '').toLowerCase() === String(val).toLowerCase());
        });
        if (fallback) {
            if (fallback._id) {
                return {
                    ...fallback,
                    _id: fallback._id,
                    createdAt: fallback.createdAt || new Date(),
                    updatedAt: fallback.updatedAt || new Date(),
                    views: fallback.views || [],
                    _article_votes: fallback.votes || [],
                };
            }
        }
        const criteria = isId ? `ID "${filter}"` : JSON.stringify(filter);
        throw new common_1.NotFoundException(`No article found for ${criteria}`);
    }
    async createArticle(data) {
        const created = new this.articleModel(data);
        const savedArticle = await created.save();
        return this.populateOne(savedArticle.toObject());
    }
    async getAllArticles() {
        const articles = await this.findWithFallback({});
        return this.populateMany(articles);
    }
    async getById(id) {
        const article = await this.findOneWithFallback(id, true);
        return this.populateOne(article);
    }
    async getBySlug(category, slug) {
        const article = await this.findOneWithFallback({ category, slug });
        return this.populateOne(article);
    }
    async getByCategory(category) {
        const articles = await this.findWithFallback({ category });
        return this.populateMany(articles);
    }
    async bulkUpdate(data) {
        const updated = [];
        for (const item of data) {
            if (!item.slug)
                continue;
            try {
                const doc = await this.articleModel
                    .findOneAndUpdate({ slug: item.slug }, item, {
                    new: true,
                    runValidators: true,
                    lean: true,
                })
                    .exec();
                if (doc)
                    updated.push(doc);
            }
            catch {
            }
        }
        return this.populateMany(updated);
    }
    async updateById(id, data) {
        if (!(0, mongoose_2.isObjectIdOrHexString)(id)) {
            throw new common_1.BadRequestException(`Invalid ID "${id}"`);
        }
        const updated = await this.articleModel
            .findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
            lean: true,
        })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`No article found for ID "${id}"`);
        }
        return this.populateOne(updated);
    }
    async updateBySlug(slug, data) {
        const updated = await this.articleModel
            .findOneAndUpdate({ slug }, data, {
            new: true,
            runValidators: true,
            lean: true,
        })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`No article found for slug "${slug}"`);
        }
        return this.populateOne(updated);
    }
    async deleteById(id) {
        await this.getById(id);
        await this.articleModel.findByIdAndDelete(id).exec();
    }
    async deleteBySlug(slug) {
        const deleted = await this.articleModel.findOneAndDelete({ slug }).lean().exec();
        if (!deleted) {
            throw new common_1.NotFoundException(`No article found for slug "${slug}"`);
        }
    }
    async populateField(id, model, dummyData) {
        const doc = await model.findById(id).lean().exec();
        if (doc)
            return doc;
        const fallback = dummyData.find((d) => d._id.equals(id));
        if (fallback)
            return fallback;
        throw new common_1.NotFoundException(`Reference ${id} not found`);
    }
    async populateArrayField(ids, model, dummyData) {
        const results = [];
        for (const id of ids) {
            try {
                results.push(await this.populateField(id, model, dummyData));
            }
            catch {
            }
        }
        return results;
    }
    async populateOne(article) {
        const { author, _id, ...rest } = article;
        const populatedAuthor = author instanceof mongoose_2.Types.ObjectId
            ? await this.populateField(author, this.userModel, dummyData_1.dummyUsers)
            : author;
        let populatedComments = await this.commentModel
            .find({ article: _id })
            .lean()
            .exec();
        if (!Array.isArray(populatedComments) || populatedComments.length === 0) {
            populatedComments = dummyData_1.dummyComments
                .filter((c) => c.article?.toString() === _id.toString())
                .map((c) => ({
                ...c,
                _id: c._id,
                createdAt: c.createdAt ?? new Date(),
                updatedAt: c.updatedAt ?? new Date(),
            }));
        }
        let populatedVotes = await this.voteModel
            .find({ target: _id, targetType: 'Article' })
            .lean()
            .exec();
        if (!Array.isArray(populatedVotes) || populatedVotes.length === 0) {
            populatedVotes = dummyData_1.dummyVotes
                .filter((v) => v.target?.toString() === _id.toString() && v.targetType === 'Article')
                .map((v) => ({
                ...v,
                _id: v._id,
                createdAt: v.createdAt ?? new Date(),
                updatedAt: v.updatedAt ?? new Date(),
            }));
        }
        let populatedViews = await this.viewModel
            .find({ article: _id })
            .lean()
            .exec();
        if (!Array.isArray(populatedViews) || populatedViews.length === 0) {
            populatedViews = dummyData_1.dummyViews
                .filter((v) => v.article?.toString() === _id.toString())
                .map((v) => ({
                ...v,
                _id: v._id,
                createdAt: v.createdAt ?? new Date(),
                updatedAt: v.updatedAt ?? new Date(),
            }));
        }
        return {
            ...rest,
            _id,
            author: populatedAuthor,
            comments: populatedComments,
            votes: populatedVotes,
            views: populatedViews,
        };
    }
    async populateMany(articles) {
        return Promise.all(articles.map((a) => this.populateOne(a)));
    }
    async trackView(id, fp) {
        if (!(0, mongoose_2.isObjectIdOrHexString)(id)) {
            throw new common_1.BadRequestException(`Invalid article ID "${id}"`);
        }
        const objId = new mongoose_2.Types.ObjectId(id);
        const articleDoc = await this.findOneWithFallback(id, true);
        const existing = await this.viewModel.findOne({ article: objId, _viewer: fp }).exec();
        if (existing) {
            await this.viewModel.updateOne({ _id: existing._id }, { updatedAt: new Date() }).exec();
            return { article: await this.populateOne(articleDoc), changed: false };
        }
        const newView = await this.viewModel.create({ article: objId, _viewer: fp });
        if (await this.articleModel.exists({ _id: objId })) {
            await this.articleModel
                .updateOne({ _id: objId }, { $push: { views: newView._id } })
                .exec();
        }
        return { article: await this.populateOne(articleDoc), changed: true };
    }
    async toggleVote(id, fp, direction) {
        if (!(0, mongoose_2.isObjectIdOrHexString)(id)) {
            throw new common_1.BadRequestException(`Invalid article ID "${id}"`);
        }
        let article;
        let isDummy = false;
        let changed = false;
        try {
            article = await this.findOneWithFallback(id, true);
            isDummy = !(await this.articleModel.exists({ _id: id }));
        }
        catch (e) {
            throw new common_1.NotFoundException(`No article found for ID "${id}"`);
        }
        let existingVote = await this.voteModel
            .findOne({
            target: new mongoose_2.Types.ObjectId(id),
            voter: fp,
            targetType: 'Article',
        })
            .lean()
            .exec();
        let updateOperation = {};
        if (existingVote) {
            await this.voteModel.findByIdAndDelete(existingVote._id).exec();
            updateOperation = { $pull: { votes: existingVote._id } };
            changed = true;
            if (existingVote.direction !== direction) {
                const newVote = await this.voteModel.create({
                    voter: fp,
                    targetType: 'Article',
                    target: new mongoose_2.Types.ObjectId(id),
                    direction,
                });
                updateOperation = { $push: { votes: newVote._id } };
                changed = true;
            }
        }
        else {
            const newVote = await this.voteModel.create({
                voter: fp,
                targetType: 'Article',
                target: new mongoose_2.Types.ObjectId(id),
                direction,
            });
            updateOperation = { $push: { votes: newVote._id } };
            changed = true;
        }
        if (!isDummy) {
            const updated = await this.articleModel
                .findByIdAndUpdate(id, updateOperation, {
                new: true,
                runValidators: true,
                lean: true,
            })
                .exec();
            if (!updated) {
                const fallback = await this.findOneWithFallback(id, true);
                return { article: await this.populateOne(fallback), changed };
            }
            return { article: await this.populateOne(updated), changed };
        }
        else {
            return { article: await this.populateOne(article), changed };
        }
    }
};
exports.ArticleService = ArticleService;
exports.ArticleService = ArticleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(article_model_1.Article.name)),
    __param(1, (0, mongoose_1.InjectModel)('User')),
    __param(2, (0, mongoose_1.InjectModel)('Comment')),
    __param(3, (0, mongoose_1.InjectModel)('Vote')),
    __param(4, (0, mongoose_1.InjectModel)('View')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ArticleService);
//# sourceMappingURL=article.service.js.map