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
exports.ViewService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const view_model_1 = require("../models/view.model");
let ViewService = class ViewService {
    constructor(viewModel) {
        this.viewModel = viewModel;
    }
    async createView(data) {
        const newView = new this.viewModel(data);
        return newView.save();
    }
    async getAllViews() {
        const views = await this.viewModel.aggregate([
            {
                $lookup: {
                    from: 'articles',
                    localField: 'article',
                    foreignField: '_id',
                    as: 'articleLookup',
                },
            },
            {
                $addFields: {
                    article: {
                        $cond: {
                            if: { $gt: [{ $size: '$articleLookup' }, 0] },
                            then: { $arrayElemAt: ['$articleLookup', 0] },
                            else: '$article',
                        },
                    },
                },
            },
            { $project: { articleLookup: 0 } },
        ]);
        return views;
    }
    async getViewById(id) {
        const [view] = await this.viewModel.aggregate([
            { $match: { _id: new mongoose_2.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'articles',
                    localField: 'article',
                    foreignField: '_id',
                    as: 'articleLookup',
                },
            },
            {
                $addFields: {
                    article: {
                        $cond: {
                            if: { $gt: [{ $size: '$articleLookup' }, 0] },
                            then: { $arrayElemAt: ['$articleLookup', 0] },
                            else: '$article',
                        },
                    },
                },
            },
            { $project: { articleLookup: 0 } },
            { $limit: 1 },
        ]);
        if (!view)
            throw new common_1.NotFoundException('View not found');
        return view;
    }
    async deleteView(id) {
        const view = await this.viewModel.findByIdAndDelete(id);
        if (!view)
            throw new common_1.NotFoundException('View not found');
        return { message: 'View deleted successfully' };
    }
    async updateView(id, data) {
        const view = await this.viewModel.findByIdAndUpdate(id, data, { new: true });
        if (!view)
            throw new common_1.NotFoundException('View not found');
        return view;
    }
};
exports.ViewService = ViewService;
exports.ViewService = ViewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(view_model_1.View.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ViewService);
//# sourceMappingURL=view.service.js.map