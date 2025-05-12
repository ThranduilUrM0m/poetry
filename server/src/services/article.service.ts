import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, isObjectIdOrHexString } from 'mongoose';
import { Article, ArticleDocument } from '../models/article.model';
import { UserDocument } from '../models/user.model';
import { CommentDocument } from '../models/comment.model';
import { VoteDocument } from '../models/vote.model';
import { ViewDocument } from '../models/view.model';
import {
    dummyArticles,
    dummyUsers,
    dummyComments,
    dummyVotes,
    dummyViews,
} from '../data/dummyData';
import _ from 'lodash';

// Define interface for populated article
export interface PopulatedArticle extends Omit<Article, 'author' | 'comments' | 'votes' | 'views'> {
    _id: Types.ObjectId;
    author: UserDocument;
    comments: CommentDocument[];
    votes: VoteDocument[];
    views: ViewDocument[];
}

const ARTICLES_FALLBACK: ArticleDocument[] = dummyArticles as unknown as ArticleDocument[];

@Injectable()
export class ArticleService {
    constructor(
        @InjectModel(Article.name)
        private readonly articleModel: Model<ArticleDocument>,
        @InjectModel('User')
        private readonly userModel: Model<UserDocument>,
        @InjectModel('Comment')
        private readonly commentModel: Model<CommentDocument>,
        @InjectModel('Vote')
        private readonly voteModel: Model<VoteDocument>,
        @InjectModel('View')
        private readonly viewModel: Model<ViewDocument>
    ) {}

    // ─── Private Helpers ─────────────────────────────────────

    /**
     * Executes a list‐query against the DB, returns fallback if no results.
     */
    private async findWithFallback(filter: FilterQuery<ArticleDocument>): Promise<Article[]> {
        const real = await this.articleModel.find(filter).lean().exec();
        return real.length > 0 ? real : ARTICLES_FALLBACK;
    }

    /**
     * Executes a single‐item query, attempts fallback, then throws if not found.
     */
    private async findOneWithFallback(
        filter: FilterQuery<ArticleDocument> | string, // allow passing an ID string
        isId = false
    ): Promise<Article> {
        let doc: ArticleDocument | null = null;

        if (isId) {
            // Pre‐validate ID format
            if (!isObjectIdOrHexString(filter as string)) {
                throw new BadRequestException(`Invalid Article ID "${filter}"`);
            }
            doc = await this.articleModel
                .findById(filter as string)
                .lean()
                .exec();
        } else {
            doc = await this.articleModel
                .findOne(filter as FilterQuery<ArticleDocument>)
                .lean()
                .exec();
        }

        // Found in DB?
        if (doc) {
            return doc;
        }

        // Attempt fallback
        let fallback = dummyArticles.find((a) => {
            if (isId) {
                return a._id && a._id.toString() === filter;
            }
            return Object.entries(filter as object).every(
                ([k, val]) =>
                    String((a as any)[k] ?? '').toLowerCase() === String(val).toLowerCase()
            );
        });

        if (fallback) {
            if (fallback._id) {
                return {
                    ...fallback,
                    _id: fallback._id,
                    createdAt: fallback.createdAt || new Date(),
                    updatedAt: fallback.updatedAt || new Date(),
                    views: fallback.views || [],
                    _article_votes: fallback.votes || [],
                } as Article;
            }
        }

        // Not found anywhere => throw
        const criteria = isId ? `ID "${filter}"` : JSON.stringify(filter);
        throw new NotFoundException(`No article found for ${criteria}`);
    }

    // ─── Create ───────────────────────────────────────────────

    async createArticle(data: Partial<Article>): Promise<PopulatedArticle> {
        const created = new this.articleModel(data);
        const savedArticle = await created.save();
        return this.populateOne(savedArticle.toObject());
    }

    // ─── Read All (with fallback) ─────────────────────────────

    async getAllArticles(): Promise<PopulatedArticle[]> {
        const articles = await this.findWithFallback({});
        return this.populateMany(articles);
    }

    // ─── Read By ID ───────────────────────────────────────────

    async getById(id: string): Promise<PopulatedArticle> {
        const article = await this.findOneWithFallback(id, true);
        return this.populateOne(article);
    }

    // ─── Read By Slug ─────────────────────────────────────────

    async getBySlug(category: string, slug: string): Promise<PopulatedArticle> {
        const article = await this.findOneWithFallback({ category, slug });
        return this.populateOne(article);
    }

    // ─── Read By Category ─────────────────────────────────────

    async getByCategory(category: string): Promise<PopulatedArticle[]> {
        const articles = await this.findWithFallback({ category });
        return this.populateMany(articles);
    }

    // ─── Bulk Update ──────────────────────────────────────────

    async bulkUpdate(data: Partial<Article>[]): Promise<PopulatedArticle[]> {
        const updated: Article[] = [];
        for (const item of data) {
            if (!item.slug) continue; // skip if no slug
            try {
                const doc = await this.articleModel
                    .findOneAndUpdate({ slug: item.slug }, item, {
                        new: true,
                        runValidators: true,
                        lean: true,
                    })
                    .exec();
                if (doc) updated.push(doc);
            } catch {
                // skip invalid updates
            }
        }
        return this.populateMany(updated);
    }

    // ─── Update By ID ─────────────────────────────────────────

    async updateById(id: string, data: Partial<Article>): Promise<PopulatedArticle> {
        if (!isObjectIdOrHexString(id)) {
            throw new BadRequestException(`Invalid ID "${id}"`);
        }
        const updated = await this.articleModel
            .findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
                lean: true,
            })
            .exec();
        if (!updated) {
            throw new NotFoundException(`No article found for ID "${id}"`);
        }
        return this.populateOne(updated);
    }

    // ─── Update By Slug ───────────────────────────────────────

    async updateBySlug(slug: string, data: Partial<Article>): Promise<PopulatedArticle> {
        const updated = await this.articleModel
            .findOneAndUpdate({ slug }, data, {
                new: true,
                runValidators: true,
                lean: true,
            })
            .exec();
        if (!updated) {
            throw new NotFoundException(`No article found for slug "${slug}"`);
        }
        return this.populateOne(updated);
    }

    // ─── Delete By ID ─────────────────────────────────────────

    async deleteById(id: string): Promise<void> {
        await this.getById(id);
        await this.articleModel.findByIdAndDelete(id).exec();
    }

    // ─── Delete By Slug ───────────────────────────────────────

    async deleteBySlug(slug: string): Promise<void> {
        const deleted = await this.articleModel.findOneAndDelete({ slug }).lean().exec();
        if (!deleted) {
            throw new NotFoundException(`No article found for slug "${slug}"`);
        }
    }

    // ─── Population Helpers ────────────────────────────────────

    private async populateField<T extends { _id: Types.ObjectId }>(
        id: Types.ObjectId,
        model: Model<any>,
        dummyData: T[]
    ): Promise<T> {
        // Try DB first
        const doc = await model.findById(id).lean().exec();
        if (doc) return doc as T;
        // Try dummy
        const fallback = dummyData.find((d) => d._id.equals(id));
        if (fallback) return fallback;
        throw new NotFoundException(`Reference ${id} not found`);
    }

    private async populateArrayField<T extends { _id: Types.ObjectId }>(
        ids: Types.ObjectId[],
        model: Model<any>,
        dummyData: T[]
    ): Promise<T[]> {
        const results: T[] = [];
        for (const id of ids) {
            try {
                results.push(await this.populateField(id, model, dummyData));
            } catch {
                // skip missing
            }
        }
        return results;
    }

    // ─── Public Population API ────────────────────────────────

    async populateOne(
        article: Article & {
            author: Types.ObjectId | UserDocument;
        }
    ): Promise<PopulatedArticle> {
        const { author, _id, ...rest } = article as Article & { _id: Types.ObjectId };

        // 1. Populate author
        const populatedAuthor =
            author instanceof Types.ObjectId
                ? await this.populateField(author, this.userModel, dummyUsers as any)
                : (author as UserDocument);

        // 2. COMMENTS: always query the DB first
        let populatedComments = await this.commentModel
            .find({ article: _id })
            .lean<CommentDocument[]>()
            .exec();

        if (!Array.isArray(populatedComments) || populatedComments.length === 0) {
            // fallback to dummyComments filtered by this article’s id
            populatedComments = dummyComments
                .filter((c) => c.article?.toString() === _id.toString())
                .map((c) => ({
                    ...c,
                    _id: c._id!,
                    createdAt: c.createdAt ?? new Date(),
                    updatedAt: c.updatedAt ?? new Date(),
                })) as CommentDocument[];
        }

        // 3. VOTES: DB first, then dummy
        let populatedVotes = await this.voteModel
            .find({ target: _id, targetType: 'Article' })
            .lean<VoteDocument[]>()
            .exec();

        if (!Array.isArray(populatedVotes) || populatedVotes.length === 0) {
            populatedVotes = dummyVotes
                .filter(
                    (v) => v.target?.toString() === _id.toString() && v.targetType === 'Article'
                )
                .map((v) => ({
                    ...v,
                    _id: v._id!,
                    createdAt: v.createdAt ?? new Date(),
                    updatedAt: v.updatedAt ?? new Date(),
                })) as VoteDocument[];
        }

        // 4. VIEWS: DB first, then dummy
        let populatedViews = await this.viewModel
            .find({ article: _id })
            .lean<ViewDocument[]>()
            .exec();

        if (!Array.isArray(populatedViews) || populatedViews.length === 0) {
            populatedViews = dummyViews
                .filter((v) => v.article?.toString() === _id.toString())
                .map((v) => ({
                    ...v,
                    _id: v._id!,
                    createdAt: v.createdAt ?? new Date(),
                    updatedAt: v.updatedAt ?? new Date(),
                })) as ViewDocument[];
        }

        return {
            ...rest,
            _id,
            author: populatedAuthor,
            comments: populatedComments,
            votes: populatedVotes,
            views: populatedViews,
        } as PopulatedArticle;
    }

    async populateMany(articles: Article[]): Promise<PopulatedArticle[]> {
        return Promise.all(articles.map((a) => this.populateOne(a)));
    }

    // ─── Views & Votes (stubs) ────────────────────────────────

    async trackView(
        id: string,
        fp: string
    ): Promise<{ article: PopulatedArticle; changed: boolean }> {
        // Validate article ID format
        if (!isObjectIdOrHexString(id)) {
            throw new BadRequestException(`Invalid article ID "${id}"`);
        }

        const objId = new Types.ObjectId(id);
        const articleDoc = await this.findOneWithFallback(id, true);
        const existing = await this.viewModel.findOne({ article: objId, _viewer: fp }).exec();

        if (existing) {
            // Just refresh timestamp
            await this.viewModel.updateOne({ _id: existing._id }, { updatedAt: new Date() }).exec();
            return { article: await this.populateOne(articleDoc), changed: false };
        }

        // Else create new view
        const newView = await this.viewModel.create({ article: objId, _viewer: fp });
        // If it's a real article, push into the article document
        if (await this.articleModel.exists({ _id: objId })) {
            await this.articleModel
                .updateOne({ _id: objId }, { $push: { views: newView._id } })
                .exec();
        }

        return { article: await this.populateOne(articleDoc), changed: true };
    }

    async toggleVote(
        id: string,
        fp: string,
        direction: 'up' | 'down'
    ): Promise<{ article: PopulatedArticle; changed: boolean }> {
        if (!isObjectIdOrHexString(id)) {
            throw new BadRequestException(`Invalid article ID "${id}"`);
        }

        let article: Article;
        let isDummy = false;
        let changed = false;

        // Find article (DB or dummy) and check if it's a dummy article
        try {
            article = await this.findOneWithFallback(id, true);
            isDummy = !(await this.articleModel.exists({ _id: id }));
        } catch (e) {
            throw new NotFoundException(`No article found for ID "${id}"`);
        }

        // Always check for existing vote in DB
        let existingVote = await this.voteModel
            .findOne({
                target: new Types.ObjectId(id),
                voter: fp,
                targetType: 'Article',
            })
            .lean()
            .exec();

        let updateOperation: any = {};
        if (existingVote) {
            await this.voteModel.findByIdAndDelete(existingVote._id).exec();
            updateOperation = { $pull: { votes: existingVote._id } };
            changed = true;

            // If direction is different, add new vote
            if (existingVote.direction !== direction) {
                const newVote = await this.voteModel.create({
                    voter: fp,
                    targetType: 'Article',
                    target: new Types.ObjectId(id),
                    direction,
                });
                updateOperation = { $push: { votes: newVote._id } };
                changed = true;
            }
        } else {
            // No existing vote, add new vote
            const newVote = await this.voteModel.create({
                voter: fp,
                targetType: 'Article',
                target: new Types.ObjectId(id),
                direction,
            });
            updateOperation = { $push: { votes: newVote._id } };
            changed = true;
        }

        // Only update article's votes array if it's a DB article
        if (!isDummy) {
            const updated = await this.articleModel
                .findByIdAndUpdate(id, updateOperation, {
                    new: true,
                    runValidators: true,
                    lean: true,
                })
                .exec();

            if (!updated) {
                const fallback = await this.findOneWithFallback(id, true);
                return { article: await this.populateOne(fallback), changed };
            }
            return { article: await this.populateOne(updated), changed };
        } else {
            // For dummy articles, just return the populated dummy article (votes will be fetched from DB in populateOne)
            return { article: await this.populateOne(article), changed };
        }
    }
}
