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
const mongoose_1 = require("mongoose");
const article_service_1 = require("../services/article.service");
const notification_service_1 = require("../services/notification.service");
const notification_gateway_1 = require("../gateways/notification.gateway");
let ArticleController = class ArticleController {
    constructor(articleService, notificationService, notificationGateway) {
        this.articleService = articleService;
        this.notificationService = notificationService;
        this.notificationGateway = notificationGateway;
    }
    async create(dto) {
        const article = await this.articleService.createArticle(dto);
        await this.notificationService.create({
            category: 'article',
            action: 'created',
            title: 'Article Created',
            message: `A new article was created: "${article.title}"`,
            metadata: {
                articleId: article._id,
                title: article.title,
                category: article.category,
                isPrivate: article.isPrivate,
                isFeatured: article.isFeatured,
                createdAt: article.createdAt,
                updatedAt: article.updatedAt,
            },
        });
        this.notificationGateway.server.emit('article:created', {
            type: 'created',
            article,
        });
        return article;
    }
    async findAll() {
        return this.articleService.getAllArticles();
    }
    async findBySlug(category, slug) {
        return this.articleService.getBySlug(category, slug);
    }
    async findByCategory(category) {
        const list = await this.articleService.getByCategory(category);
        if (!list.length) {
            throw new common_1.NotFoundException(`No articles in "${category}"`);
        }
        return list;
    }
    async updateOne(idOrSlug, dto) {
        const isId = (0, mongoose_1.isObjectIdOrHexString)(idOrSlug);
        let prevArticle;
        try {
            prevArticle = isId
                ? await this.articleService.getById(idOrSlug)
                : await this.articleService.getBySlug(dto.category || '', idOrSlug);
        }
        catch (err) {
            throw new common_1.NotFoundException(`Article "${idOrSlug}" not found for update`);
        }
        let article;
        try {
            article = isId
                ? await this.articleService.updateById(idOrSlug, dto)
                : await this.articleService.updateBySlug(idOrSlug, dto);
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException)
                throw err;
            throw new common_1.BadRequestException(`Failed to update "${idOrSlug}"`);
        }
        const changedFields = {};
        for (const key of Object.keys(dto)) {
            if (prevArticle[key] !== article[key]) {
                changedFields[key] = {
                    old: prevArticle[key],
                    new: article[key],
                };
            }
        }
        const changedKeys = Object.keys(changedFields);
        const message = changedKeys.length > 0
            ? `Article "${article.title}" updated: ${changedKeys
                .map((k) => `${k}: "${changedFields[k].old}" → "${changedFields[k].new}"`)
                .join(', ')}`
            : `Article "${article.title}" updated (no visible changes)`;
        await this.notificationService.create({
            category: 'article',
            action: 'updated',
            title: 'Article Updated',
            message,
            metadata: {
                articleId: article._id,
                title: article.title,
                category: article.category,
                isPrivate: article.isPrivate,
                isFeatured: article.isFeatured,
                createdAt: article.createdAt,
                updatedAt: article.updatedAt,
                changed: changedFields,
            },
        });
        this.notificationGateway.server.emit('article:updated', {
            type: 'updated',
            article,
            changed: changedFields,
        });
        return article;
    }
    async updateMany(dtos) {
        const prevArticles = await this.articleService.getAllArticles();
        const prevMap = new Map(prevArticles.map((a) => [a._id.toString(), a]));
        const updatedArticles = await this.articleService.bulkUpdate(dtos);
        for (const article of updatedArticles) {
            const prev = prevMap.get(article._id.toString());
            if (!prev)
                continue;
            const changedFields = {};
            for (const key of Object.keys(article)) {
                if (prev[key] !== article[key]) {
                    changedFields[key] = {
                        old: prev[key],
                        new: article[key],
                    };
                }
            }
            const changedKeys = Object.keys(changedFields);
            const message = changedKeys.length > 0
                ? `Article "${article.title}" updated: ${changedKeys
                    .map((k) => `${k}: "${changedFields[k].old}" → "${changedFields[k].new}"`)
                    .join(', ')}`
                : `Article "${article.title}" updated (no visible changes)`;
            await this.notificationService.create({
                category: 'article',
                action: 'updated',
                title: 'Article Updated',
                message,
                metadata: {
                    articleId: article._id,
                    title: article.title,
                    category: article.category,
                    isPrivate: article.isPrivate,
                    isFeatured: article.isFeatured,
                    createdAt: article.createdAt,
                    updatedAt: article.updatedAt,
                    changed: changedFields,
                },
            });
            this.notificationGateway.server.emit('article:updated', {
                type: 'updated',
                article,
                changed: changedFields,
            });
        }
        return updatedArticles;
    }
    async delete(idOrSlug) {
        const isId = (0, mongoose_1.isObjectIdOrHexString)(idOrSlug);
        let deletedArticle = null;
        try {
            deletedArticle = isId
                ? await this.articleService.getById(idOrSlug)
                : await this.articleService.getBySlug('', idOrSlug);
            if (isId) {
                await this.articleService.deleteById(idOrSlug);
            }
            else {
                await this.articleService.deleteBySlug(idOrSlug);
            }
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException)
                throw err;
            throw new common_1.BadRequestException(`Failed to delete "${idOrSlug}"`);
        }
        if (deletedArticle) {
            await this.notificationService.create({
                category: 'article',
                action: 'deleted',
                title: 'Article Deleted',
                message: `Article deleted: "${deletedArticle.title}"`,
                metadata: {
                    articleId: deletedArticle._id,
                    title: deletedArticle.title,
                    category: deletedArticle.category,
                    isPrivate: deletedArticle.isPrivate,
                    isFeatured: deletedArticle.isFeatured,
                    createdAt: deletedArticle.createdAt,
                    updatedAt: deletedArticle.updatedAt,
                },
            });
            this.notificationGateway.server.emit('article:deleted', {
                type: 'deleted',
                deletedArticle,
            });
        }
        return { message: `Deleted ${isId ? 'ID' : 'slug'} ${idOrSlug}` };
    }
    async trackView(id, fp) {
        try {
            const { article, changed } = await this.articleService.trackView(id, fp);
            if (changed) {
                await this.notificationService.create({
                    category: 'article',
                    action: 'viewed',
                    title: 'Article Viewed',
                    message: `Article "${article.title}" was viewed.`,
                    metadata: {
                        articleId: article._id,
                        title: article.title,
                        category: article.category,
                        isPrivate: article.isPrivate,
                        isFeatured: article.isFeatured,
                        createdAt: article.createdAt,
                        updatedAt: article.updatedAt,
                        fingerprint: fp,
                    },
                });
                this.notificationGateway.server.emit('article:viewed', {
                    type: 'viewed',
                    article,
                    fingerprint: fp,
                });
            }
            return article;
        }
        catch {
            throw new common_1.HttpException('Failed to track view', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async toggleVote(id, body) {
        try {
            const { article, changed } = await this.articleService.toggleVote(id, body.fingerprint, body.direction);
            if (changed) {
                await this.notificationService.create({
                    category: 'article',
                    action: 'voted',
                    title: 'Article Voted',
                    message: `Article "${article.title}" received a "${body.direction}" vote.`,
                    metadata: {
                        articleId: article._id,
                        title: article.title,
                        category: article.category,
                        isPrivate: article.isPrivate,
                        isFeatured: article.isFeatured,
                        createdAt: article.createdAt,
                        updatedAt: article.updatedAt,
                        fingerprint: body.fingerprint,
                        direction: body.direction,
                    },
                });
                this.notificationGateway.server.emit('article:voted', {
                    type: 'voted',
                    article,
                    direction: body.direction,
                    fingerprint: body.fingerprint,
                });
            }
            return article;
        }
        catch {
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
], ArticleController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('bySlug/:category/:slug'),
    __param(0, (0, common_1.Param)('category')),
    __param(1, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Get)(':category'),
    __param(0, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "findByCategory", null);
__decorate([
    (0, common_1.Patch)(':identifier'),
    __param(0, (0, common_1.Param)('identifier')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "updateOne", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "updateMany", null);
__decorate([
    (0, common_1.Delete)(':identifier'),
    __param(0, (0, common_1.Param)('identifier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/views'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('fingerprint')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "trackView", null);
__decorate([
    (0, common_1.Post)(':id/vote'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "toggleVote", null);
exports.ArticleController = ArticleController = __decorate([
    (0, common_1.Controller)('api/articles'),
    __metadata("design:paramtypes", [article_service_1.ArticleService,
        notification_service_1.NotificationService,
        notification_gateway_1.NotificationGateway])
], ArticleController);
//# sourceMappingURL=article.controller.js.map