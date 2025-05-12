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
const article_model_1 = require("../models/article.model");
const dummyData_1 = require("../data/dummyData");
let ViewService = class ViewService {
    constructor(viewModel, articleModel) {
        this.viewModel = viewModel;
        this.articleModel = articleModel;
    }
    validateId(id, entity = 'ID') {
        if (!(0, mongoose_2.isObjectIdOrHexString)(id)) {
            throw new common_1.BadRequestException(`Invalid ${entity} "${id}"`);
        }
        return new mongoose_2.Types.ObjectId(id);
    }
    getArticleLookupPipeline() {
        return [
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
                        $cond: [
                            { $gt: [{ $size: '$articleLookup' }, 0] },
                            { $arrayElemAt: ['$articleLookup', 0] },
                            '$article',
                        ],
                    },
                },
            },
            { $project: { articleLookup: 0 } },
        ];
    }
    async aggregateViews(matchStage, limit, skip) {
        const pipeline = [];
        if (matchStage)
            pipeline.push(matchStage);
        pipeline.push(...this.getArticleLookupPipeline());
        if (typeof skip === 'number')
            pipeline.push({ $skip: skip });
        if (typeof limit === 'number')
            pipeline.push({ $limit: limit });
        return this.viewModel.aggregate(pipeline).exec();
    }
    async getViewByIdOrThrow(id) {
        const objectId = this.validateId(id, 'view ID');
        const [view] = await this.aggregateViews({ $match: { _id: objectId } }, 1);
        if (!view) {
            throw new common_1.NotFoundException(`View "${id}" not found`);
        }
        return view;
    }
    async findWithFallback(filter) {
        const real = await this.viewModel.find(filter).lean().exec();
        return real.length > 0 ? real : dummyData_1.dummyViews;
    }
    async findOneWithFallback(filter, isId = false) {
        let doc = null;
        if (isId) {
            if (!(0, mongoose_2.isObjectIdOrHexString)(filter)) {
                throw new common_1.BadRequestException(`Invalid View ID "${filter}"`);
            }
            doc = await this.viewModel
                .findById(filter)
                .lean()
                .exec();
        }
        else {
            doc = await this.viewModel
                .findOne(filter)
                .lean()
                .exec();
        }
        if (doc)
            return doc;
        let fallback = dummyData_1.dummyViews.find((v) => {
            if (isId) {
                return v._id && v._id.toString() === filter;
            }
            return Object.entries(filter).every(([k, val]) => String(v[k] ?? '').toLowerCase() === String(val).toLowerCase());
        });
        if (fallback) {
            if (fallback._viewer && fallback._id) {
                return {
                    _id: fallback._id,
                    _viewer: fallback._viewer,
                    article: fallback.article,
                    createdAt: fallback.createdAt || new Date(),
                    updatedAt: fallback.updatedAt || new Date(),
                };
            }
        }
        const criteria = isId ? `ID "${filter}"` : JSON.stringify(filter);
        throw new common_1.NotFoundException(`No view found for ${criteria}`);
    }
    async populateView(view) {
        let article;
        if (view.article instanceof mongoose_2.Types.ObjectId) {
            const found = await this.articleModel.findById(view.article).lean().exec();
            if (found && typeof found.title === 'string') {
                article = found;
            }
            else {
                article = dummyData_1.dummyArticles.find((a) => a._id &&
                    a._id.toString() === view.article.toString() &&
                    typeof a.title === 'string');
            }
        }
        else if (typeof view.article === 'string') {
            article = dummyData_1.dummyArticles.find((a) => a._id &&
                a._id.toString() === view.article.toString() &&
                typeof a.title === 'string');
        }
        else if (typeof view.article === 'object' &&
            view.article &&
            '_id' in view.article &&
            typeof view.article.title === 'string') {
            article = view.article;
        }
        if (!article || !article._id) {
            throw new common_1.NotFoundException('Associated article not found');
        }
        return { ...view, article: article._id };
    }
    async createView(data) {
        if (!data.article) {
            throw new common_1.BadRequestException('Article ID is required');
        }
        data.article = this.validateId(data.article.toString(), 'article ID');
        const created = new this.viewModel(data);
        const saved = await created.save();
        return this.populateView(saved.toObject());
    }
    async getAllViews() {
        const views = await this.aggregateViews();
        return Promise.all(views.map((v) => this.populateView(v)));
    }
    async getViewById(id) {
        const view = await this.getViewByIdOrThrow(id);
        return this.populateView(view);
    }
    async updateView(id, data) {
        if (!(0, mongoose_2.isObjectIdOrHexString)(id)) {
            throw new common_1.BadRequestException(`Invalid view ID "${id}"`);
        }
        const updated = await this.viewModel
            .findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
            lean: true,
        })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`View "${id}" not found`);
        }
        return this.populateView(updated);
    }
    async deleteView(id) {
        this.validateId(id, 'view ID');
        const deleted = await this.viewModel.findByIdAndDelete(id).exec();
        if (!deleted) {
            throw new common_1.NotFoundException(`View "${id}" not found`);
        }
        return { message: 'View deleted successfully' };
    }
};
exports.ViewService = ViewService;
exports.ViewService = ViewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(view_model_1.View.name)),
    __param(1, (0, mongoose_1.InjectModel)(article_model_1.Article.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ViewService);
//# sourceMappingURL=view.service.js.map