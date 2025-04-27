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
let CommentService = class CommentService {
    constructor(commentModel) {
        this.commentModel = commentModel;
    }
    async getCommentsByArticle(articleId) {
        try {
            const articleObjectId = new mongoose_2.Types.ObjectId(articleId);
            const comments = await this.commentModel.aggregate([
                { $match: { article: articleObjectId } },
                {
                    $lookup: {
                        from: 'articles',
                        localField: 'article',
                        foreignField: '_id',
                        as: 'articleLookup',
                    },
                },
                {
                    $addFields: {
                        article: {
                            $cond: [
                                { $gt: [{ $size: '$articleLookup' }, 0] },
                                { $arrayElemAt: ['$articleLookup', 0] },
                                '$article',
                            ],
                        },
                    },
                },
                { $project: { articleLookup: 0 } },
                {
                    $lookup: {
                        from: 'comments',
                        localField: 'Parent',
                        foreignField: '_id',
                        as: 'parentLookup',
                    },
                },
                {
                    $addFields: {
                        Parent: {
                            $cond: [
                                { $gt: [{ $size: '$parentLookup' }, 0] },
                                { $arrayElemAt: ['$parentLookup', 0] },
                                '$Parent',
                            ],
                        },
                    },
                },
                { $project: { parentLookup: 0 } },
                { $sort: { createdAt: -1 } },
            ]);
            return comments;
        }
        catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    }
    async commentExists(id) {
        const idToCheck = typeof id === 'string' ? id : id.toString();
        if (!mongoose_2.Types.ObjectId.isValid(idToCheck))
            return false;
        const exists = await this.commentModel.exists({
            _id: new mongoose_2.Types.ObjectId(idToCheck),
        });
        return !!exists;
    }
    async createComment(data) {
        if (data.Parent) {
            const parentId = data.Parent.toString();
            const parentExists = await this.commentExists(parentId);
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
            const comments = await this.commentModel.aggregate([
                {
                    $lookup: {
                        from: 'articles',
                        localField: 'article',
                        foreignField: '_id',
                        as: 'articleLookup',
                    },
                },
                {
                    $addFields: {
                        article: {
                            $cond: {
                                if: { $gt: [{ $size: '$articleLookup' }, 0] },
                                then: { $arrayElemAt: ['$articleLookup', 0] },
                                else: '$article',
                            },
                        },
                    },
                },
                { $project: { articleLookup: 0 } },
                {
                    $lookup: {
                        from: 'comments',
                        localField: 'Parent',
                        foreignField: '_id',
                        as: 'parentLookup',
                    },
                },
                {
                    $addFields: {
                        Parent: {
                            $cond: {
                                if: { $gt: [{ $size: '$parentLookup' }, 0] },
                                then: { $arrayElemAt: ['$parentLookup', 0] },
                                else: '$Parent',
                            },
                        },
                    },
                },
                { $project: { parentLookup: 0 } },
                { $sort: { createdAt: -1 } },
            ]);
            const validComments = comments.filter((comment) => comment.article);
            if (validComments.length === 0) {
                console.warn('No valid comments found in database');
                return [];
            }
            return validComments;
        }
        catch (error) {
            console.error('Error in getAllComments service:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to fetch comments: ${errorMessage}`);
        }
    }
    async getCommentById(id) {
        const [comment] = await this.commentModel.aggregate([
            { $match: { _id: new mongoose_2.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'articles',
                    localField: 'article',
                    foreignField: '_id',
                    as: 'articleLookup',
                },
            },
            {
                $addFields: {
                    article: {
                        $cond: [
                            { $gt: [{ $size: '$articleLookup' }, 0] },
                            { $arrayElemAt: ['$articleLookup', 0] },
                            '$article',
                        ],
                    },
                },
            },
            { $project: { articleLookup: 0 } },
            {
                $lookup: {
                    from: 'comments',
                    localField: 'Parent',
                    foreignField: '_id',
                    as: 'parentLookup',
                },
            },
            {
                $addFields: {
                    Parent: {
                        $cond: [
                            { $gt: [{ $size: '$parentLookup' }, 0] },
                            { $arrayElemAt: ['$parentLookup', 0] },
                            '$Parent',
                        ],
                    },
                },
            },
            { $project: { parentLookup: 0 } },
        ]);
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        return comment;
    }
    async updateComment(id, data) {
        if (data.Parent) {
            throw new common_1.BadRequestException('Cannot change comment parent');
        }
        const updatedComment = await this.commentModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
        const [comment] = await this.commentModel.aggregate([
            { $match: { _id: updatedComment?._id } },
            {
                $lookup: {
                    from: 'articles',
                    localField: 'article',
                    foreignField: '_id',
                    as: 'articleLookup',
                },
            },
            {
                $addFields: {
                    article: {
                        $cond: [
                            { $gt: [{ $size: '$articleLookup' }, 0] },
                            { $arrayElemAt: ['$articleLookup', 0] },
                            '$article',
                        ],
                    },
                },
            },
            { $project: { articleLookup: 0 } },
            {
                $lookup: {
                    from: 'comments',
                    localField: 'Parent',
                    foreignField: '_id',
                    as: 'parentLookup',
                },
            },
            {
                $addFields: {
                    Parent: {
                        $cond: [
                            { $gt: [{ $size: '$parentLookup' }, 0] },
                            { $arrayElemAt: ['$parentLookup', 0] },
                            '$Parent',
                        ],
                    },
                },
            },
            { $project: { parentLookup: 0 } },
        ]);
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        return comment;
    }
    async deleteComment(id) {
        const [commentToDelete] = await this.commentModel.aggregate([
            { $match: { _id: new mongoose_2.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'articles',
                    localField: 'article',
                    foreignField: '_id',
                    as: 'articleLookup',
                },
            },
            {
                $addFields: {
                    article: {
                        $cond: [
                            { $gt: [{ $size: '$articleLookup' }, 0] },
                            { $arrayElemAt: ['$articleLookup', 0] },
                            '$article',
                        ],
                    },
                },
            },
            { $project: { articleLookup: 0 } },
            {
                $lookup: {
                    from: 'comments',
                    localField: 'Parent',
                    foreignField: '_id',
                    as: 'parentLookup',
                },
            },
            {
                $addFields: {
                    Parent: {
                        $cond: [
                            { $gt: [{ $size: '$parentLookup' }, 0] },
                            { $arrayElemAt: ['$parentLookup', 0] },
                            '$Parent',
                        ],
                    },
                },
            },
            { $project: { parentLookup: 0 } },
        ]);
        await this.commentModel.findByIdAndDelete(id);
        if (!commentToDelete)
            throw new common_1.NotFoundException('Comment not found');
        return { message: 'Comment deleted successfully' };
    }
};
exports.CommentService = CommentService;
exports.CommentService = CommentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(comment_model_1.Comment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CommentService);
//# sourceMappingURL=comment.service.js.map