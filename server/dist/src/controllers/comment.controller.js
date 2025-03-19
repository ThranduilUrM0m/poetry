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
const comment_service_1 = require("../services/comment.service");
const dummyArticles_1 = require("../data/dummyArticles");
let CommentController = class CommentController {
    constructor(commentService) {
        this.commentService = commentService;
    }
    populateDummyArticle(comment) {
        const article = dummyArticles_1.dummyArticles.find((article) => article._id?.toString() === comment.article?.toString());
        return {
            ...comment,
            article: article || comment.article,
        };
    }
    async createComment(data) {
        return this.commentService.createComment(data);
    }
    async getAllComments() {
        const comments = await this.commentService.getAllComments();
        if (comments.length === 0) {
            return dummyArticles_1.dummyComments.map((comment) => this.populateDummyArticle(comment));
        }
        console.log(comments);
        return comments;
    }
    async getCommentById(id) {
        const comment = await this.commentService.getCommentById(id);
        if (!comment) {
            const dummyComment = dummyArticles_1.dummyComments.find((a) => a._id === id);
            if (!dummyComment) {
                throw new common_1.NotFoundException('Comment not found');
            }
            return this.populateDummyArticle(dummyComment);
        }
        return comment;
    }
    async updateComment(id, data) {
        return this.commentService.updateComment(id, data);
    }
    async deleteComment(id) {
        return this.commentService.deleteComment(id);
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "deleteComment", null);
exports.CommentController = CommentController = __decorate([
    (0, common_1.Controller)('api/comments'),
    __metadata("design:paramtypes", [comment_service_1.CommentService])
], CommentController);
//# sourceMappingURL=comment.controller.js.map