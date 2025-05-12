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
const vote_module_1 = require("./vote.module");
const article_module_1 = require("./article.module");
const auth_module_1 = require("../auth/auth.module");
const notification_module_1 = require("./notification.module");
let CommentModule = class CommentModule {
};
exports.CommentModule = CommentModule;
exports.CommentModule = CommentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: comment_model_1.Comment.name, schema: comment_model_1.CommentSchema }]),
            (0, common_1.forwardRef)(() => vote_module_1.VoteModule),
            (0, common_1.forwardRef)(() => article_module_1.ArticleModule),
            (0, common_1.forwardRef)(() => article_module_1.ArticleModule),
            auth_module_1.AuthModule,
            notification_module_1.NotificationModule
        ],
        controllers: [comment_controller_1.CommentController],
        providers: [comment_service_1.CommentService],
        exports: [mongoose_1.MongooseModule, comment_service_1.CommentService],
    })
], CommentModule);
//# sourceMappingURL=comment.module.js.map