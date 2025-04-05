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
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const view_model_1 = require("../models/view.model");
const article_model_1 = require("../models/article.model");
const view_service_1 = require("../services/view.service");
const dummyData_1 = require("../data/dummyData");
let ViewController = class ViewController {
    constructor(viewService, viewModel, articleModel) {
        this.viewService = viewService;
        this.viewModel = viewModel;
        this.articleModel = articleModel;
    }
    async populateField(id, model, dummyData) {
        const doc = await model.findById(id).lean().exec();
        if (doc) {
            return doc;
        }
        const fallback = dummyData.find((item) => item._id.toString() === id.toString());
        if (fallback) {
            return fallback;
        }
        throw new common_1.NotFoundException(`Unable to populate field for id ${id.toString()}`);
    }
    async populateView(view) {
        const populatedView = {
            ...view,
            article: {},
        };
        if (view.article && view.article instanceof mongoose_2.Types.ObjectId) {
            populatedView.article = await this.populateField(view.article, this.articleModel, dummyData_1.dummyArticles);
        }
        else {
            populatedView.article = view.article;
        }
        return populatedView;
    }
    async createView(data) {
        const newView = await this.viewService.createView(data);
        return this.populateView(newView);
    }
    async getAllViews() {
        const viewsFromDb = await this.viewService.getAllViews();
        if (viewsFromDb.length > 0) {
            return Promise.all(viewsFromDb.map((view) => this.populateView(view)));
        }
        return Promise.all(dummyData_1.dummyViews.map(async (view) => this.populateView(view)));
    }
    async getViewById(id) {
        const viewFromDb = await this.viewService.getViewById(id);
        if (viewFromDb) {
            return this.populateView(viewFromDb);
        }
        const dummyView = dummyData_1.dummyViews.find((a) => a._id?.toString() === id);
        if (!dummyView) {
            throw new common_1.NotFoundException('View not found');
        }
        return this.populateView(dummyView);
    }
    async updateView(id, data) {
        const updatedView = await this.viewService.updateView(id, data);
        return this.populateView(updatedView);
    }
    async deleteView(id) {
        return this.viewService.deleteView(id);
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
    (0, common_1.Put)(':id'),
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
    __param(1, (0, mongoose_1.InjectModel)(view_model_1.View.name)),
    __param(2, (0, mongoose_1.InjectModel)(article_model_1.Article.name)),
    __metadata("design:paramtypes", [view_service_1.ViewService,
        mongoose_2.Model,
        mongoose_2.Model])
], ViewController);
//# sourceMappingURL=view.controller.js.map