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
exports.CommentController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const comment_model_1 = require("../models/comment.model");
const article_model_1 = require("../models/article.model");
const vote_model_1 = require("../models/vote.model");
const comment_service_1 = require("../services/comment.service");
const dummyData_1 = require("../data/dummyData");
const jwt_1 = require("@nestjs/jwt");
let CommentController = class CommentController {
    constructor(commentService, jwtService, commentModel, articleModel, voteModel) {
        this.commentService = commentService;
        this.jwtService = jwtService;
        this.commentModel = commentModel;
        this.articleModel = articleModel;
        this.voteModel = voteModel;
    }
    async populateField(id, model, dummyData) {
        try {
            const doc = await model.findById(id).lean().exec();
            if (doc) {
                return doc;
            }
            const targetId = id.toString();
            const fallback = dummyData.find((item) => {
                const itemId = typeof item._id === 'string' ? item._id : item._id.toString();
                return itemId === targetId;
            });
            return fallback || null;
        }
        catch (error) {
            console.warn(`Failed to populate field for id ${id.toString()}:`, error);
            return null;
        }
    }
    async populateArrayField(ids, model, dummyData) {
        const results = [];
        for (const id of ids) {
            try {
                const validId = typeof id === 'string' ? new mongoose_2.Types.ObjectId(id) : id;
                const item = await this.populateField(validId, model, dummyData);
                if (item) {
                    results.push(item);
                }
            }
            catch (error) {
                const idString = id instanceof mongoose_2.Types.ObjectId ? id.toString() : String(id);
                console.warn(`Failed to populate array field for id ${idString}:`, error);
                continue;
            }
        }
        return results;
    }
    async populateComment(comment) {
        const populatedComment = {
            ...comment,
            Parent: comment.Parent ? comment.Parent : null,
            article: comment.article ? comment.article : null,
            _comment_votes: [],
        };
        try {
            if (comment.Parent) {
                try {
                    const parentId = typeof comment.Parent === 'string'
                        ? new mongoose_2.Types.ObjectId(comment.Parent)
                        : comment.Parent instanceof mongoose_2.Types.ObjectId
                            ? comment.Parent
                            : new mongoose_2.Types.ObjectId(comment.Parent._id || comment.Parent);
                    let populatedParent = await this.commentModel
                        .findById(parentId)
                        .lean()
                        .exec();
                    if (!populatedParent) {
                        const dummyParent = dummyData_1.dummyComments.find((c) => c._id?.toString() === parentId.toString());
                        if (dummyParent) {
                            populatedParent = {
                                ...dummyParent,
                                _id: parentId,
                                __v: 0,
                            };
                        }
                    }
                    if (populatedParent) {
                        populatedComment.Parent = populatedParent;
                    }
                }
                catch (error) {
                    console.warn('Invalid Parent ID format:', error);
                    populatedComment.Parent = null;
                }
            }
            if (comment.article) {
                try {
                    console.log('Article before population:', comment.article);
                    const articleId = typeof comment.article === 'string'
                        ? new mongoose_2.Types.ObjectId(comment.article)
                        : comment.article instanceof mongoose_2.Types.ObjectId
                            ? comment.article
                            : new mongoose_2.Types.ObjectId(comment.article?._id?.toString() || comment.article.toString());
                    console.log('Article ID after conversion:', articleId.toString());
                    let populatedArticle = await this.articleModel
                        .findById(articleId)
                        .lean()
                        .exec();
                    console.log('Found in database:', !!populatedArticle);
                    if (!populatedArticle) {
                        const dummyArticle = dummyData_1.dummyArticles.find((a) => a._id?.toString() === articleId.toString());
                        console.log('Found in dummy data:', !!dummyArticle);
                        if (dummyArticle) {
                            populatedArticle = {
                                ...dummyArticle,
                                _id: articleId,
                                __v: 0,
                            };
                        }
                    }
                    if (populatedArticle) {
                        populatedComment.article = populatedArticle;
                    }
                    else {
                        console.warn(`No article found for ID: ${articleId}`);
                        populatedComment.article = null;
                    }
                }
                catch (error) {
                    console.error('Error populating article:', error);
                    console.debug('Original article value:', comment.article);
                    populatedComment.article = null;
                }
            }
            if (Array.isArray(comment._comment_votes) && comment._comment_votes.length > 0) {
                const voteIds = comment._comment_votes.map((v) => v instanceof mongoose_2.Types.ObjectId ? v : new mongoose_2.Types.ObjectId(v.toString()));
                const votes = await Promise.all(voteIds.map(async (voteId) => {
                    const vote = await this.voteModel.findById(voteId).lean().exec();
                    if (vote)
                        return vote;
                    return dummyData_1.dummyVotes.find((v) => v._id?.toString() === voteId.toString());
                }));
                populatedComment._comment_votes = votes.filter((v) => v !== undefined);
            }
            return populatedComment;
        }
        catch (error) {
            console.error('Error populating comment:', error);
            return populatedComment;
        }
    }
    async createComment(data) {
        if (data.article && typeof data.article === 'string') {
            data.article = new mongoose_2.Types.ObjectId(data.article);
        }
        if (data.Parent) {
            const parentId = data.Parent.toString();
            const parentExists = await this.commentService.commentExists(parentId);
            if (!parentExists) {
                throw new common_1.NotFoundException('Parent comment not found');
            }
        }
        const newComment = new this.commentModel({
            ...data,
            isFeatured: data.isFeatured || true,
        });
        return newComment.save();
    }
    async getAllComments() {
        try {
            const commentsFromDb = await this.commentService.getAllComments();
            console.log('Retrieving :', commentsFromDb.filter((c) => { return c.article; }));
            if (!commentsFromDb) {
                return Promise.all(dummyData_1.dummyComments.map((comment) => this.populateComment(comment)));
            }
            if (commentsFromDb.length === 0) {
                return Promise.all(dummyData_1.dummyComments.map((comment) => this.populateComment(comment)));
            }
            const populatedComments = await Promise.all(commentsFromDb.map(async (comment) => {
                try {
                    return await this.populateComment(comment);
                }
                catch (error) {
                    console.error(`Error populating comment:`, error);
                    return null;
                }
            }));
            return populatedComments.filter((comment) => comment !== null);
        }
        catch (error) {
            console.error('Error in getAllComments controller:', error);
            throw new common_1.HttpException('Failed to fetch comments', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCommentById(id) {
        const commentFromDb = await this.commentService.getCommentById(id);
        if (commentFromDb) {
            return this.populateComment(commentFromDb);
        }
        const dummyComment = dummyData_1.dummyComments.find((a) => a._id?.toString() === id);
        if (!dummyComment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        return this.populateComment(dummyComment);
    }
    async fetchCommentsByArticle(id) {
        const commentsFromDb = await this.commentService.getCommentsByArticle(id);
        if (!commentsFromDb || commentsFromDb.length === 0) {
            return [];
        }
        return Promise.all(commentsFromDb.map((comment) => this.populateComment(comment)));
    }
    async updateComment(id, data) {
        if (data.Parent) {
            throw new common_1.BadRequestException('Cannot change comment parent');
        }
        const updatedComment = await this.commentService.updateComment(id, data);
        return this.populateComment(updatedComment);
    }
    async deleteComment(id, authHeader, fingerprint) {
        const comment = await this.commentService.getCommentById(id);
        if (!comment) {
            throw new common_1.NotFoundException('Comment not found');
        }
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const payload = this.jwtService.verify(token);
                if (payload) {
                    return this.commentService.deleteComment(id);
                }
            }
            catch (error) {
                throw new common_1.UnauthorizedException('Invalid token');
            }
        }
        if (fingerprint && comment._comment_fingerprint === fingerprint) {
            return this.commentService.deleteComment(id);
        }
        throw new common_1.UnauthorizedException('Unauthorized to delete this comment');
    }
    async vote(id, body) {
        const { fingerprint, direction } = body;
        return this.toggleVote(id, fingerprint, direction);
    }
    async toggleVote(id, fingerprint, direction) {
        try {
            const comment = await this.commentModel.findById(id).lean().exec();
            if (!comment) {
                const dummyComment = dummyData_1.dummyComments.find((a) => a._id?.toString() === id);
                if (dummyComment) {
                    const existingDummyVote = dummyData_1.dummyVotes.find((vote) => vote.target?.toString() === id && vote.voter === fingerprint);
                    if (existingDummyVote) {
                        return this.populateComment(dummyComment);
                    }
                    await this.voteModel.create({
                        voter: fingerprint,
                        targetType: 'Comment',
                        target: new mongoose_2.Types.ObjectId(id),
                        direction,
                    });
                    return this.populateComment(dummyComment);
                }
                throw new common_1.NotFoundException('Comment not found');
            }
            const existingVote = await this.voteModel
                .findOne({ target: new mongoose_2.Types.ObjectId(id), voter: fingerprint })
                .exec();
            let update;
            if (existingVote) {
                if (existingVote.direction === direction) {
                    await this.voteModel.findByIdAndDelete(existingVote._id).exec();
                    update = { $pull: { _comment_votes: existingVote._id } };
                }
                else {
                    await this.voteModel.findByIdAndDelete(existingVote._id).exec();
                    update = { $pull: { _comment_votes: existingVote._id } };
                    const newVote = await this.voteModel.create({
                        voter: fingerprint,
                        targetType: 'Comment',
                        target: new mongoose_2.Types.ObjectId(id),
                        direction,
                    });
                    update = { $push: { _comment_votes: newVote._id } };
                }
            }
            else {
                const newVote = await this.voteModel.create({
                    voter: fingerprint,
                    targetType: 'Comment',
                    target: new mongoose_2.Types.ObjectId(id),
                    direction,
                });
                update = { $push: { _comment_votes: newVote._id } };
            }
            const updatedComment = await this.commentModel
                .findByIdAndUpdate(new mongoose_2.Types.ObjectId(id), update, { new: true, lean: true })
                .exec();
            if (!updatedComment) {
                throw new common_1.NotFoundException('Comment not found after update');
            }
            return this.populateComment(updatedComment);
        }
        catch (error) {
            console.error(error);
            throw new common_1.HttpException('Failed to process vote', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CommentController = CommentController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "createComment", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "getAllComments", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "getCommentById", null);
__decorate([
    (0, common_1.Get)('article/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "fetchCommentsByArticle", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "updateComment", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-comment-fingerprint')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.Post)(':id/vote'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "vote", null);
exports.CommentController = CommentController = __decorate([
    (0, common_1.Controller)('api/comments'),
    __param(2, (0, mongoose_1.InjectModel)(comment_model_1.Comment.name)),
    __param(3, (0, mongoose_1.InjectModel)(article_model_1.Article.name)),
    __param(4, (0, mongoose_1.InjectModel)(vote_model_1.Vote.name)),
    __metadata("design:paramtypes", [comment_service_1.CommentService,
        jwt_1.JwtService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], CommentController);
//# sourceMappingURL=comment.controller.js.map