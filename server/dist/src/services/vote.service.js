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
exports.VoteService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const vote_model_1 = require("../models/vote.model");
let VoteService = class VoteService {
    constructor(voteModel) {
        this.voteModel = voteModel;
    }
    async createVote(data) {
        const newVote = new this.voteModel(data);
        return newVote.save();
    }
    async getAllVotes() {
        const votes = await this.voteModel.find().populate('target');
        return votes;
    }
    async getVoteById(id) {
        const vote = await this.voteModel.findById(id).populate('target');
        if (!vote)
            throw new common_1.NotFoundException('Vote not found');
        return vote;
    }
    async deleteVote(id) {
        const vote = await this.voteModel.findByIdAndDelete(id);
        if (!vote)
            throw new common_1.NotFoundException('Vote not found');
        return { message: 'Vote deleted successfully' };
    }
    async updateVote(id, data) {
        const vote = await this.voteModel.findByIdAndUpdate(id, data, { new: true });
        if (!vote)
            throw new common_1.NotFoundException('Vote not found');
        return vote;
    }
};
exports.VoteService = VoteService;
exports.VoteService = VoteService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(vote_model_1.Vote.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], VoteService);
//# sourceMappingURL=vote.service.js.map