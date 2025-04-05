"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const comment_controller_1 = require("../controllers/comment.controller");
const comment_service_1 = require("../services/comment.service");
const comment_model_1 = require("../models/comment.model");
const vote_model_1 = require("../models/vote.model");
const article_model_1 = require("../models/article.model");
let CommentModule = class CommentModule {
};
exports.CommentModule = CommentModule;
exports.CommentModule = CommentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: comment_model_1.Comment.name, schema: comment_model_1.CommentSchema },
                { name: article_model_1.Article.name, schema: article_model_1.ArticleSchema },
                { name: vote_model_1.Vote.name, schema: vote_model_1.VoteSchema },
            ]),
        ],
        controllers: [comment_controller_1.CommentController],
        providers: [comment_service_1.CommentService],
    })
], CommentModule);
//# sourceMappingURL=comment.module.js.map