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
exports.ViewController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const view_service_1 = require("../services/view.service");
const article_service_1 = require("../services/article.service");
const dummyData_1 = require("../data/dummyData");
let ViewController = class ViewController {
    constructor(viewService, articleService) {
        this.viewService = viewService;
        this.articleService = articleService;
    }
    async createView(data) {
        const view = await this.viewService.createView(data);
        return this.populateView(view);
    }
    async getAllViews() {
        const views = await this.viewService.getAllViews();
        return Promise.all(views.map((v) => this.populateView(v)));
    }
    async getViewById(id) {
        let view;
        try {
            view = await this.viewService.getViewById(id);
        }
        catch {
            const dummy = dummyData_1.dummyViews.find((d) => d._id?.toString() === id);
            if (!dummy) {
                throw new common_1.NotFoundException('View not found');
            }
            view = dummy;
        }
        return this.populateView(view);
    }
    async updateView(id, data) {
        const updated = await this.viewService.updateView(id, data);
        return this.populateView(updated);
    }
    async deleteView(id) {
        return this.viewService.deleteView(id);
    }
    async populateView(view) {
        let article = null;
        if (view.article instanceof mongoose_1.Types.ObjectId) {
            try {
                article = await this.articleService.getById(view.article.toString());
            }
            catch {
                article = null;
            }
        }
        else {
            article = view.article;
        }
        if (!article) {
            const fallback = dummyData_1.dummyArticles.find((a) => a._id !== undefined && a._id.toString() === view.article.toString());
            if (fallback && fallback._id) {
                article = fallback;
            }
        }
        if (!article) {
            throw new common_1.NotFoundException('Associated article not found');
        }
        return { ...view, article };
    }
};
exports.ViewController = ViewController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ViewController.prototype, "createView", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ViewController.prototype, "getAllViews", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ViewController.prototype, "getViewById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ViewController.prototype, "updateView", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ViewController.prototype, "deleteView", null);
exports.ViewController = ViewController = __decorate([
    (0, common_1.Controller)('api/views'),
    __metadata("design:paramtypes", [view_service_1.ViewService,
        article_service_1.ArticleService])
], ViewController);
//# sourceMappingURL=view.controller.js.map