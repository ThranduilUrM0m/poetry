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
const dummyData_1 = require("../data/dummyData");
let VoteService = class VoteService {
    constructor(voteModel) {
        this.voteModel = voteModel;
    }
    validateId(id, entity = 'vote ID') {
        if (!(0, mongoose_2.isObjectIdOrHexString)(id)) {
            throw new common_1.BadRequestException(`Invalid ${entity} "${id}"`);
        }
        return new mongoose_2.Types.ObjectId(id);
    }
    async getByIdOrThrow(id) {
        const objectId = this.validateId(id);
        const vote = await this.voteModel.findById(objectId).lean().exec();
        if (!vote) {
            throw new common_1.NotFoundException(`Vote "${id}" not found`);
        }
        return vote;
    }
    async findOneWithFallback(filter, isId = false) {
        let doc = null;
        if (isId) {
            if (!(0, mongoose_2.isObjectIdOrHexString)(filter)) {
                throw new common_1.BadRequestException(`Invalid Vote ID "${filter}"`);
            }
            doc = await this.voteModel.findById(filter).lean().exec();
        }
        else {
            doc = await this.voteModel.findOne(filter).lean().exec();
        }
        if (doc)
            return doc;
        let fallback = dummyData_1.dummyVotes.find(v => {
            if (isId) {
                return v._id && v._id.toString() === filter;
            }
            return Object.entries(filter).every(([k, val]) => String(v[k] ?? '').toLowerCase() === String(val).toLowerCase());
        });
        if (fallback) {
            if (fallback._id && fallback.voter && fallback.target) {
                return {
                    ...fallback,
                    _id: fallback._id,
                    createdAt: fallback.createdAt || new Date(),
                    updatedAt: fallback.updatedAt || new Date()
                };
            }
        }
        const criteria = isId ? `ID "${filter}"` : JSON.stringify(filter);
        throw new common_1.NotFoundException(`No vote found for ${criteria}`);
    }
    async createVote(data) {
        if (!data.target || !data.targetType) {
            throw new common_1.BadRequestException('`target` and `targetType` are required');
        }
        const vote = new this.voteModel(data);
        return (await vote.save()).toObject();
    }
    async getAllVotes() {
        return this.voteModel.find().lean().exec();
    }
    async getVoteById(id) {
        return this.getByIdOrThrow(id);
    }
    async updateVote(id, data) {
        this.validateId(id);
        const updated = await this.voteModel
            .findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
            lean: true,
        })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Vote "${id}" not found`);
        }
        return updated;
    }
    async deleteVote(id) {
        this.validateId(id);
        const deleted = await this.voteModel.findByIdAndDelete(id).exec();
        if (!deleted) {
            throw new common_1.NotFoundException(`Vote "${id}" not found`);
        }
        return { message: 'Vote deleted successfully' };
    }
};
exports.VoteService = VoteService;
exports.VoteService = VoteService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(vote_model_1.Vote.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], VoteService);
//# sourceMappingURL=vote.service.js.map