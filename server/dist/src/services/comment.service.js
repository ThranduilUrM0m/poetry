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
exports.CommentService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const comment_model_1 = require("../models/comment.model");
const vote_model_1 = require("../models/vote.model");
const dummyData_1 = require("../data/dummyData");
const article_service_1 = require("./article.service");
const COMMENTS_FALLBACK = dummyData_1.dummyComments;
let CommentService = class CommentService {
    constructor(commentModel, voteModel, articleService) {
        this.commentModel = commentModel;
        this.voteModel = voteModel;
        this.articleService = articleService;
    }
    async findCommentsWithFallback(filter) {
        const real = await this.commentModel.find(filter).lean().exec();
        if (real.length)
            return real;
        return COMMENTS_FALLBACK.filter((c) => Object.entries(filter).every(([k, v]) => String(c[k]) === String(v)));
    }
    async findCommentWithFallback(id, withVotes = false) {
        if (!(0, mongoose_2.isObjectIdOrHexString)(id)) {
            throw new common_1.BadRequestException(`Invalid comment ID "${id}"`);
        }
        const query = this.commentModel.findById(id);
        if (withVotes) {
            query.populate('_comment_votes');
        }
        const doc = await query.lean().exec();
        if (doc) {
            return doc;
        }
        const fallback = COMMENTS_FALLBACK.find((c) => c._id.equals(id));
        if (fallback) {
            return fallback;
        }
        throw new common_1.NotFoundException(`Comment "${id}" not found`);
    }
    async findOneWithFallback(filter, isId = false) {
        let doc = null;
        if (isId) {
            if (!(0, mongoose_2.isObjectIdOrHexString)(filter)) {
                throw new common_1.BadRequestException(`Invalid Comment ID "${filter}"`);
            }
            doc = await this.commentModel
                .findById(filter)
                .lean()
                .exec();
        }
        else {
            doc = await this.commentModel
                .findOne(filter)
                .lean()
                .exec();
        }
        if (doc)
            return doc;
        let fallback = dummyData_1.dummyComments.find((c) => {
            if (isId) {
                return c._id && c._id.toString() === filter;
            }
            return Object.entries(filter).every(([k, val]) => String(c[k] ?? '').toLowerCase() === String(val).toLowerCase());
        });
        if (fallback) {
            if (fallback._id && fallback._comment_author) {
                return {
                    ...fallback,
                    _id: fallback._id,
                    _comment_votes: fallback._comment_votes || [],
                };
            }
        }
        const criteria = isId ? `ID "${filter}"` : JSON.stringify(filter);
        throw new common_1.NotFoundException(`No comment found for ${criteria}`);
    }
    async createComment(data) {
        if (data.Parent) {
            if (!(0, mongoose_2.isObjectIdOrHexString)(data.Parent.toString())) {
                throw new common_1.BadRequestException('Invalid Parent ID');
            }
            const exists = await this.commentModel
                .exists({
                _id: new mongoose_2.Types.ObjectId(data.Parent),
            })
                .exec();
            if (!exists) {
                throw new common_1.NotFoundException('Parent comment not found');
            }
        }
        const created = new this.commentModel({
            ...data,
            isFeatured: data.isFeatured ?? true,
        });
        return (await created.save()).toObject();
    }
    async getAllComments() {
        const rawComments = await this.findCommentsWithFallback({});
        return Promise.all(rawComments.map((c) => this.populateOne(c)));
    }
    async getCommentById(id) {
        const comment = await this.findCommentWithFallback(id);
        return this.populateOne(comment);
    }
    async getCommentsByArticle(articleId) {
        if (!(0, mongoose_2.isObjectIdOrHexString)(articleId)) {
            throw new common_1.BadRequestException('Invalid article ID');
        }
        const rawComments = await this.findCommentsWithFallback({
            article: new mongoose_2.Types.ObjectId(articleId),
        });
        return Promise.all(rawComments.map((c) => this.populateOne(c)));
    }
    async updateComment(id, data) {
        if (data.Parent) {
            throw new common_1.BadRequestException('Cannot change Parent of a comment');
        }
        if (!(0, mongoose_2.isObjectIdOrHexString)(id)) {
            throw new common_1.BadRequestException(`Invalid comment ID "${id}"`);
        }
        const updated = await this.commentModel
            .findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
            lean: true,
        })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Comment "${id}" not found`);
        }
        return updated;
    }
    async deleteComment(id) {
        if (!(0, mongoose_2.isObjectIdOrHexString)(id)) {
            throw new common_1.BadRequestException(`Invalid comment ID "${id}"`);
        }
        const res = await this.commentModel.findByIdAndDelete(id).exec();
        if (!res) {
            throw new common_1.NotFoundException(`Comment "${id}" not found`);
        }
    }
    async populateArrayField(ids, model, dummyData) {
        const results = [];
        for (const id of ids) {
            try {
                const doc = await model.findById(id).lean().exec();
                if (doc)
                    results.push(doc);
            }
            catch {
                const dummy = dummyData.find((d) => d._id.equals(id));
                if (dummy)
                    results.push(dummy);
            }
        }
        return results;
    }
    async populateOne(comment) {
        const { _comment_votes, Parent, article: articleRef, _id, ...rest } = comment;
        let populatedParent = null;
        if (Parent) {
            try {
                populatedParent = await this.findCommentWithFallback(Parent.toString(), true);
            }
            catch {
                populatedParent = null;
            }
        }
        let populatedArticle = null;
        if (articleRef) {
            try {
                populatedArticle = await this.articleService.getById(articleRef.toString());
            }
            catch {
                populatedArticle = null;
            }
        }
        let populatedVotes = await this.voteModel
            .find({ target: _id, targetType: 'Comment' })
            .lean()
            .exec();
        if (!Array.isArray(populatedVotes) || populatedVotes.length === 0) {
            populatedVotes = dummyData_1.dummyVotes
                .filter((v) => v.target?.toString() === _id.toString() && v.targetType === 'Comment')
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
            Parent: populatedParent,
            article: populatedArticle,
            _comment_votes: populatedVotes,
        };
    }
    async populateMany(raw) {
        return Promise.all(raw.map((c) => this.populateOne(c)));
    }
    async toggleVote(commentId, fingerprint, direction) {
        if (!(0, mongoose_2.isObjectIdOrHexString)(commentId)) {
            throw new common_1.BadRequestException(`Invalid comment ID "${commentId}"`);
        }
        let comment;
        let isDummy = false;
        let changed = false;
        try {
            comment = await this.findOneWithFallback(commentId, true);
            isDummy = !(await this.commentModel.exists({ _id: commentId }));
        }
        catch (e) {
            throw new common_1.NotFoundException(`No comment found for ID "${commentId}"`);
        }
        let existingVote = await this.voteModel
            .findOne({
            target: new mongoose_2.Types.ObjectId(commentId),
            voter: fingerprint,
            targetType: 'Comment',
        })
            .lean()
            .exec();
        let updateOperation = {};
        if (existingVote) {
            await this.voteModel.findByIdAndDelete(existingVote._id).exec();
            updateOperation = { $pull: { _comment_votes: existingVote._id } };
            changed = true;
            if (existingVote.direction !== direction) {
                const newVote = await this.voteModel.create({
                    voter: fingerprint,
                    targetType: 'Comment',
                    target: new mongoose_2.Types.ObjectId(commentId),
                    direction,
                });
                updateOperation = { $push: { _comment_votes: newVote._id } };
                changed = true;
            }
        }
        else {
            const newVote = await this.voteModel.create({
                voter: fingerprint,
                targetType: 'Comment',
                target: new mongoose_2.Types.ObjectId(commentId),
                direction,
            });
            updateOperation = { $push: { _comment_votes: newVote._id } };
            changed = true;
        }
        if (!isDummy) {
            const updated = await this.commentModel
                .findByIdAndUpdate(commentId, updateOperation, {
                new: true,
                runValidators: true,
                lean: true,
            })
                .exec();
            if (!updated) {
                const fallback = await this.findOneWithFallback(commentId, true);
                return { comment: await this.populateOne(fallback), changed };
            }
            return { comment: await this.populateOne(updated), changed };
        }
        else {
            return { comment: await this.populateOne(comment), changed };
        }
    }
};
exports.CommentService = CommentService;
exports.CommentService = CommentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(comment_model_1.Comment.name)),
    __param(1, (0, mongoose_1.InjectModel)(vote_model_1.Vote.name)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => article_service_1.ArticleService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        article_service_1.ArticleService])
], CommentService);
//# sourceMappingURL=comment.service.js.map