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
const user_model_1 = require("../models/user.model");
const comment_model_1 = require("../models/comment.model");
const view_model_1 = require("../models/view.model");
const vote_model_1 = require("../models/vote.model");
let ArticleModule = class ArticleModule {
};
exports.ArticleModule = ArticleModule;
exports.ArticleModule = ArticleModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: article_model_1.Article.name, schema: article_model_1.ArticleSchema },
                { name: user_model_1.User.name, schema: user_model_1.UserSchema },
                { name: comment_model_1.Comment.name, schema: comment_model_1.CommentSchema },
                { name: view_model_1.View.name, schema: view_model_1.ViewSchema },
                { name: vote_model_1.Vote.name, schema: vote_model_1.VoteSchema },
            ]),
        ],
        controllers: [article_controller_1.ArticleController],
        providers: [article_service_1.ArticleService],
    })
], ArticleModule);
//# sourceMappingURL=article.module.js.map