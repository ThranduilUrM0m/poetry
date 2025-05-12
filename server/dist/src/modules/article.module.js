"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const article_controller_1 = require("../controllers/article.controller");
const article_service_1 = require("../services/article.service");
const article_model_1 = require("../models/article.model");
const user_module_1 = require("./user.module");
const comment_module_1 = require("./comment.module");
const vote_module_1 = require("./vote.module");
const view_module_1 = require("./view.module");
const notification_module_1 = require("./notification.module");
let ArticleModule = class ArticleModule {
};
exports.ArticleModule = ArticleModule;
exports.ArticleModule = ArticleModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: article_model_1.Article.name, schema: article_model_1.ArticleSchema }]),
            user_module_1.UserModule,
            (0, common_1.forwardRef)(() => comment_module_1.CommentModule),
            (0, common_1.forwardRef)(() => vote_module_1.VoteModule),
            (0, common_1.forwardRef)(() => view_module_1.ViewModule),
            notification_module_1.NotificationModule
        ],
        controllers: [article_controller_1.ArticleController],
        providers: [article_service_1.ArticleService],
        exports: [article_service_1.ArticleService],
    })
], ArticleModule);
//# sourceMappingURL=article.module.js.map