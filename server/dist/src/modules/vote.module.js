"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const vote_controller_1 = require("../controllers/vote.controller");
const vote_service_1 = require("../services/vote.service");
const vote_model_1 = require("../models/vote.model");
const article_module_1 = require("./article.module");
const comment_module_1 = require("./comment.module");
let VoteModule = class VoteModule {
};
exports.VoteModule = VoteModule;
exports.VoteModule = VoteModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: vote_model_1.Vote.name, schema: vote_model_1.VoteSchema }]),
            (0, common_1.forwardRef)(() => article_module_1.ArticleModule),
            (0, common_1.forwardRef)(() => comment_module_1.CommentModule)
        ],
        controllers: [vote_controller_1.VoteController],
        providers: [vote_service_1.VoteService],
        exports: [mongoose_1.MongooseModule, vote_service_1.VoteService],
    })
], VoteModule);
//# sourceMappingURL=vote.module.js.map