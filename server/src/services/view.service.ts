// src/services/view.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage, FilterQuery, isObjectIdOrHexString } from 'mongoose';
import { View, ViewDocument } from '../models/view.model';
import { Article, ArticleDocument } from '../models/article.model';
import { dummyArticles, dummyViews } from 'src/data/dummyData';

@Injectable()
export class ViewService {
    constructor(
        @InjectModel(View.name)
        private readonly viewModel: Model<ViewDocument>,
        @InjectModel(Article.name)
        private readonly articleModel: Model<ArticleDocument>
    ) {}

    // ─── Private Helpers ────────────────────────────────────

    /**
     * Ensures a string is a valid ObjectId, or throws BadRequestException.
     */
    private validateId(id: string, entity = 'ID'): Types.ObjectId {
        if (!isObjectIdOrHexString(id)) {
            throw new BadRequestException(`Invalid ${entity} "${id}"`);
        }
        return new Types.ObjectId(id);
    }

    /**
     * Builds the aggregation pipeline to populate the `article` field.
     */
    private getArticleLookupPipeline(): PipelineStage[] {
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

    /**
     * Runs an aggregation with an optional match stage, and returns plain JS objects.
     */
    private async aggregateViews(
        matchStage?: PipelineStage.Match,
        limit?: number,
        skip?: number
    ): Promise<View[]> {
        const pipeline: PipelineStage[] = [];
        if (matchStage) pipeline.push(matchStage);
        pipeline.push(...this.getArticleLookupPipeline());
        if (typeof skip === 'number') pipeline.push({ $skip: skip });
        if (typeof limit === 'number') pipeline.push({ $limit: limit });
        return this.viewModel.aggregate(pipeline).exec();
    }

    /**
     * Fetches a single view by ID (populated), or throws NotFoundException.
     */
    private async getViewByIdOrThrow(id: string): Promise<View> {
        const objectId = this.validateId(id, 'view ID');
        const [view] = await this.aggregateViews({ $match: { _id: objectId } }, 1);
        if (!view) {
            throw new NotFoundException(`View "${id}" not found`);
        }
        return view;
    }

    private async findWithFallback(filter: FilterQuery<ViewDocument>): Promise<View[]> {
        const real = await this.viewModel.find(filter).lean().exec();
        return real.length > 0 ? real : (dummyViews as View[]);
    }

    private async findOneWithFallback(
        filter: FilterQuery<ViewDocument> | string,
        isId = false
    ): Promise<View> {
        let doc: ViewDocument | null = null;

        if (isId) {
            if (!isObjectIdOrHexString(filter as string)) {
                throw new BadRequestException(`Invalid View ID "${filter}"`);
            }
            doc = await this.viewModel
                .findById(filter as string)
                .lean()
                .exec();
        } else {
            doc = await this.viewModel
                .findOne(filter as FilterQuery<ViewDocument>)
                .lean()
                .exec();
        }

        if (doc) return doc;

        // Cast dummy data to correct type and handle undefined _id
        let fallback = dummyViews.find((v) => {
            if (isId) {
                return v._id && v._id.toString() === filter;
            }
            return Object.entries(filter as object).every(
                ([k, val]) =>
                    String((v as any)[k] ?? '').toLowerCase() === String(val).toLowerCase()
            );
        });

        if (fallback) {
            // Ensure all required fields are present before casting
            if (fallback._viewer && fallback._id) {
                return {
                    _id: fallback._id,
                    _viewer: fallback._viewer,
                    article: fallback.article as Types.ObjectId,
                    createdAt: fallback.createdAt || new Date(),
                    updatedAt: fallback.updatedAt || new Date(),
                } as View;
            }
        }

        const criteria = isId ? `ID "${filter}"` : JSON.stringify(filter);
        throw new NotFoundException(`No view found for ${criteria}`);
    }

    private async populateView(view: View): Promise<View> {
        // Populate article reference
        let article: ArticleDocument | undefined;
        if (view.article instanceof Types.ObjectId) {
            const found = await this.articleModel.findById(view.article).lean().exec();
            if (found && typeof found.title === 'string') {
                article = found as ArticleDocument;
            } else {
                // fallback to dummyArticles with required fields
                article = dummyArticles.find(
                    (a) =>
                        a._id &&
                        a._id.toString() === view.article.toString() &&
                        typeof a.title === 'string'
                ) as ArticleDocument | undefined;
            }
        } else if (typeof view.article === 'string') {
            // fallback for string id
            article = dummyArticles.find(
                (a) =>
                    a._id &&
                    a._id.toString() === view.article.toString() &&
                    typeof a.title === 'string'
            ) as ArticleDocument | undefined;
        } else if (
            typeof view.article === 'object' &&
            view.article &&
            '_id' in view.article &&
            typeof (view.article as any).title === 'string'
        ) {
            article = view.article as ArticleDocument;
        }

        if (!article || !article._id) {
            throw new NotFoundException('Associated article not found');
        }

        return { ...view, article: article._id };
    }

    // ─── Public API ─────────────────────────────────────────

    /**
     * Create a new view record.
     */
    async createView(data: Partial<View>): Promise<View> {
        if (!data.article) {
            throw new BadRequestException('Article ID is required');
        }
        // Validate and cast article ObjectId
        data.article = this.validateId(data.article.toString(), 'article ID');
        const created = new this.viewModel(data);
        const saved = await created.save();
        return this.populateView(saved.toObject());
    }

    /**
     * Get all views, with article populated.
     */
    async getAllViews(): Promise<View[]> {
        const views = await this.aggregateViews();
        return Promise.all(views.map((v) => this.populateView(v)));
    }

    /**
     * Get a single view by ID, with article populated.
     */
    async getViewById(id: string): Promise<View> {
        const view = await this.getViewByIdOrThrow(id);
        return this.populateView(view);
    }

    /**
     * Update a view by ID.
     */
    async updateView(id: string, data: Partial<View>): Promise<View> {
        if (!isObjectIdOrHexString(id)) {
            throw new BadRequestException(`Invalid view ID "${id}"`);
        }
        const updated = await this.viewModel
            .findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
                lean: true,
            })
            .exec();
        if (!updated) {
            throw new NotFoundException(`View "${id}" not found`);
        }
        return this.populateView(updated);
    }

    /**
     * Delete a view by ID.
     */
    async deleteView(id: string): Promise<{ message: string }> {
        this.validateId(id, 'view ID');
        const deleted = await this.viewModel.findByIdAndDelete(id).exec();
        if (!deleted) {
            throw new NotFoundException(`View "${id}" not found`);
        }
        return { message: 'View deleted successfully' };
    }
}
