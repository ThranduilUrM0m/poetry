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
const mongoose_1 = require("mongoose");
const vote_service_1 = require("../services/vote.service");
const article_service_1 = require("../services/article.service");
const comment_service_1 = require("../services/comment.service");
const dummyData_1 = require("../data/dummyData");
let VoteController = class VoteController {
    constructor(voteService, articleService, commentService) {
        this.voteService = voteService;
        this.articleService = articleService;
        this.commentService = commentService;
    }
    async populateField(id, loaderFn, dummyData) {
        try {
            return await loaderFn(id.toString());
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException) {
                const fallback = dummyData.find((d) => d._id?.toString() === id.toString());
                if (fallback)
                    return fallback;
            }
            throw err;
        }
    }
    async populateVote(vote) {
        if (!vote.target || !vote.targetType) {
            throw new common_1.BadRequestException('Missing target info');
        }
        const targetId = vote.target instanceof mongoose_1.Types.ObjectId
            ? vote.target
            : new mongoose_1.Types.ObjectId(vote.target);
        let populated;
        if (vote.targetType === 'Article') {
            populated = await this.populateField(targetId, this.articleService.getById.bind(this.articleService), dummyData_1.dummyArticles);
        }
        else {
            populated = await this.populateField(targetId, this.commentService.getCommentById.bind(this.commentService), dummyData_1.dummyComments);
        }
        return { ...vote, target: populated };
    }
    async createVote(data) {
        const newVote = await this.voteService.createVote(data);
        return this.populateVote(newVote);
    }
    async getAllVotes() {
        const votes = await this.voteService.getAllVotes();
        if (votes.length) {
            return Promise.all(votes.map((v) => this.populateVote(v)));
        }
        return Promise.all(dummyData_1.dummyVotes.map((v) => this.populateVote(v)));
    }
    async getVoteById(id) {
        const vote = await this.voteService.getVoteById(id);
        return this.populateVote(vote);
    }
    async updateVote(id, data) {
        const updated = await this.voteService.updateVote(id, data);
        return this.populateVote(updated);
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
    __metadata("design:paramtypes", [vote_service_1.VoteService,
        article_service_1.ArticleService,
        comment_service_1.CommentService])
], VoteController);
//# sourceMappingURL=vote.controller.js.map