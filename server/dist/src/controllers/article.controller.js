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
const article_service_1 = require("../services/article.service");
const dummyArticles_1 = require("../data/dummyArticles");
let ArticleController = class ArticleController {
    constructor(articleService) {
        this.articleService = articleService;
    }
    populateDummyAuthor(article) {
        const author = dummyArticles_1.dummyUsers.find((user) => user._id?.toString() === article.author?.toString());
        return {
            ...article,
            author: author || article.author,
        };
    }
    async createArticle(data) {
        return this.articleService.createArticle(data);
    }
    async getAllArticles() {
        const articles = await this.articleService.getAllArticles();
        if (articles.length === 0) {
            return dummyArticles_1.dummyArticles.map((article) => this.populateDummyAuthor(article));
        }
        console.log(articles);
        return articles;
    }
    async getArticlesByCategory(category) {
        const articles = await this.articleService.getArticleByCategory(category);
        if (articles.length === 0) {
            const filteredDummy = dummyArticles_1.dummyArticles.filter((article) => article.category?.toLowerCase() === category.toLowerCase());
            if (filteredDummy.length === 0) {
                throw new common_1.NotFoundException('No articles found for this category');
            }
            return filteredDummy.map((article) => this.populateDummyAuthor(article));
        }
        return articles;
    }
    async getArticleBySlug(category, slug) {
        const article = await this.articleService.findBySlug(category, slug);
        if (!article) {
            const dummyArticle = dummyArticles_1.dummyArticles.find((a) => a.category?.toLowerCase() === category.toLowerCase() && a.slug === slug);
            if (!dummyArticle) {
                throw new common_1.NotFoundException('Article not found');
            }
            return this.populateDummyAuthor(dummyArticle);
        }
        return article;
    }
    async updateArticle(slug, data) {
        return this.articleService.updateArticle(slug, data);
    }
    async updateArticles(data) {
        return this.articleService.updateArticles(data);
    }
    async deleteArticle(slug) {
        return this.articleService.deleteArticle(slug);
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
exports.ArticleController = ArticleController = __decorate([
    (0, common_1.Controller)('api/articles'),
    __metadata("design:paramtypes", [article_service_1.ArticleService])
], ArticleController);
//# sourceMappingURL=article.controller.js.map