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
exports.VoteController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const vote_model_1 = require("../models/vote.model");
const vote_service_1 = require("../services/vote.service");
const dummyData_1 = require("../data/dummyData");
const article_model_1 = require("../models/article.model");
const comment_model_1 = require("../models/comment.model");
let VoteController = class VoteController {
    constructor(voteService, voteModel, articleModel, commentModel) {
        this.voteService = voteService;
        this.voteModel = voteModel;
        this.articleModel = articleModel;
        this.commentModel = commentModel;
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
    async populateVote(vote) {
        const populatedVote = { ...vote, target: {} };
        if (vote.targetType === 'Article') {
            const article = await this.populateField(vote.target, this.articleModel, dummyData_1.dummyArticles);
            populatedVote.target = article;
        }
        else if (vote.targetType === 'Comment') {
            const comment = await this.populateField(vote.target, this.commentModel, dummyData_1.dummyComments);
            populatedVote.target = comment;
        }
        else {
            throw new common_1.NotFoundException('Invalid target type');
        }
        return populatedVote;
    }
    async createVote(data) {
        if (!data.targetType || !data.target) {
            throw new common_1.NotFoundException('Target type and target ID must be provided');
        }
        const newVote = await this.voteService.createVote(data);
        return this.populateVote(newVote);
    }
    async getAllVotes() {
        const votesFromDb = await this.voteService.getAllVotes();
        if (votesFromDb.length > 0) {
            return Promise.all(votesFromDb.map((vote) => this.populateVote(vote)));
        }
        return Promise.all(dummyData_1.dummyVotes.map(async (vote) => this.populateVote(vote)));
    }
    async getVoteById(id) {
        const voteFromDb = await this.voteService.getVoteById(id);
        if (voteFromDb) {
            return this.populateVote(voteFromDb);
        }
        const dummyVote = dummyData_1.dummyVotes.find((a) => a._id?.toString() === id);
        if (!dummyVote) {
            throw new common_1.NotFoundException('Vote not found');
        }
        return this.populateVote(dummyVote);
    }
    async updateVote(id, data) {
        const updatedVote = await this.voteService.updateVote(id, data);
        return this.populateVote(updatedVote);
    }
    async deleteVote(id) {
        return this.voteService.deleteVote(id);
    }
};
exports.VoteController = VoteController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "createVote", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getAllVotes", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "getVoteById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "updateVote", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VoteController.prototype, "deleteVote", null);
exports.VoteController = VoteController = __decorate([
    (0, common_1.Controller)('api/votes'),
    __param(1, (0, mongoose_1.InjectModel)(vote_model_1.Vote.name)),
    __param(2, (0, mongoose_1.InjectModel)(article_model_1.Article.name)),
    __param(3, (0, mongoose_1.InjectModel)(comment_model_1.Comment.name)),
    __metadata("design:paramtypes", [vote_service_1.VoteService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], VoteController);
//# sourceMappingURL=vote.controller.js.map