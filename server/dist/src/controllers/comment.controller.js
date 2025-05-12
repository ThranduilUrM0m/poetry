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
const jwt_1 = require("@nestjs/jwt");
const comment_service_1 = require("../services/comment.service");
const notification_service_1 = require("../services/notification.service");
const notification_gateway_1 = require("../gateways/notification.gateway");
let CommentController = class CommentController {
    constructor(commentService, jwtService, notificationService, notificationGateway) {
        this.commentService = commentService;
        this.jwtService = jwtService;
        this.notificationService = notificationService;
        this.notificationGateway = notificationGateway;
    }
    async create(dto) {
        const comment = await this.commentService.createComment(dto);
        let articleTitle = '';
        if (comment.article && typeof comment.article === 'object' && 'title' in comment.article) {
            articleTitle = comment.article.title;
        }
        else {
            articleTitle = comment.article?.toString() || '';
        }
        await this.notificationService.create({
            category: 'comment',
            action: 'created',
            title: 'New Comment',
            message: `New comment by "${comment._comment_author}" on article "${articleTitle}"`,
            metadata: {
                commentId: comment._id,
                author: comment._comment_author,
                email: comment._comment_email,
                article: comment.article,
                body: comment._comment_body,
            },
        });
        this.notificationGateway.server.emit('comment:created', {
            type: 'created',
            comment,
        });
        return comment;
    }
    async findAll() {
        return this.commentService.getAllComments();
    }
    async findOne(id) {
        return this.commentService.getCommentById(id);
    }
    async findByArticle(id) {
        return this.commentService.getCommentsByArticle(id);
    }
    async update(id, dto) {
        const prevComment = await this.commentService.getCommentById(id);
        const updated = await this.commentService.updateComment(id, dto);
        const changedFields = {};
        for (const key of Object.keys(dto)) {
            if (prevComment[key] !== updated[key]) {
                changedFields[key] = {
                    old: prevComment[key],
                    new: updated[key],
                };
            }
        }
        const changedKeys = Object.keys(changedFields);
        if (changedKeys.length > 0) {
            const message = `Comment updated: ${changedKeys
                .map((k) => `${k}: "${changedFields[k].old}" → "${changedFields[k].new}"`)
                .join(', ')}`;
            await this.notificationService.create({
                category: 'comment',
                action: 'updated',
                title: 'Comment Updated',
                message,
                metadata: {
                    commentId: updated._id,
                    author: updated._comment_author,
                    article: updated.article,
                    changed: changedFields,
                },
            });
            this.notificationGateway.server.emit('comment:updated', {
                type: 'updated',
                comment: updated,
                changed: changedFields,
            });
        }
        return updated;
    }
    async remove(id, auth, fp) {
        const comment = await this.commentService.getCommentById(id);
        if (auth) {
            const token = auth.replace(/^Bearer\s/, '');
            try {
                this.jwtService.verify(token);
                await this.commentService.deleteComment(id);
                await this.notificationService.create({
                    category: 'comment',
                    action: 'deleted',
                    title: 'Comment Deleted',
                    message: `Comment by "${comment._comment_author}" deleted (admin)`,
                    metadata: {
                        commentId: comment._id,
                        author: comment._comment_author,
                        article: comment.article,
                    },
                });
                this.notificationGateway.server.emit('comment:deleted', {
                    type: 'deleted',
                    commentId: comment._id,
                });
                return { message: 'Deleted by admin' };
            }
            catch {
                throw new common_1.UnauthorizedException('Invalid token');
            }
        }
        if (fp && comment._comment_fingerprint === fp) {
            await this.commentService.deleteComment(id);
            await this.notificationService.create({
                category: 'comment',
                action: 'deleted',
                title: 'Comment Deleted',
                message: `Comment by "${comment._comment_author}" deleted (owner)`,
                metadata: {
                    commentId: comment._id,
                    author: comment._comment_author,
                    article: comment.article,
                },
            });
            this.notificationGateway.server.emit('comment:deleted', {
                type: 'deleted',
                commentId: comment._id,
            });
            return { message: 'Deleted by owner' };
        }
        throw new common_1.UnauthorizedException('Not allowed to delete this comment');
    }
    async vote(id, body) {
        try {
            const { comment, changed } = await this.commentService.toggleVote(id, body.fingerprint, body.direction);
            if (changed) {
                await this.notificationService.create({
                    category: 'comment',
                    action: 'voted',
                    title: 'Comment Voted',
                    message: `Comment by "${comment._comment_author}" received a "${body.direction}" vote.`,
                    metadata: {
                        commentId: comment._id,
                        author: comment._comment_author,
                        article: comment.article,
                        direction: body.direction,
                        fingerprint: body.fingerprint,
                    },
                });
                this.notificationGateway.server.emit('comment:voted', {
                    type: 'voted',
                    commentId: comment._id,
                    direction: body.direction,
                    fingerprint: body.fingerprint,
                });
            }
            return comment;
        }
        catch (err) {
            throw new common_1.HttpException(err.message || 'Vote failed', err.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
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
], CommentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('article/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "findByArticle", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-comment-fingerprint')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "remove", null);
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
    __metadata("design:paramtypes", [comment_service_1.CommentService,
        jwt_1.JwtService,
        notification_service_1.NotificationService,
        notification_gateway_1.NotificationGateway])
], CommentController);
//# sourceMappingURL=comment.controller.js.map