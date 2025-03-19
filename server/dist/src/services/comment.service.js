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
    async createComment(data) {
        const newComment = new this.commentModel(data);
        return newComment.save();
    }
    async getAllComments() {
        const comments = await this.commentModel.find().populate('article');
        return comments;
    }
    async getCommentById(id) {
        const comment = await this.commentModel.findById(id).populate('article');
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        return comment;
    }
    async deleteComment(id) {
        const comment = await this.commentModel.findByIdAndDelete(id);
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        return { message: 'Comment deleted successfully' };
    }
    async updateComment(id, data) {
        const comment = await this.commentModel.findByIdAndUpdate(id, data, { new: true });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        return comment;
    }
};
exports.CommentService = CommentService;
exports.CommentService = CommentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(comment_model_1.Comment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CommentService);
//# sourceMappingURL=comment.service.js.map