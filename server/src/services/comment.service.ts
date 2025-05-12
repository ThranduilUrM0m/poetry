import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, isObjectIdOrHexString } from 'mongoose';
import { Comment, CommentDocument } from '../models/comment.model';
import { Vote, VoteDocument } from '../models/vote.model';
import { dummyComments, dummyVotes } from '../data/dummyData';
import { ArticleService } from './article.service';
import { PopulatedArticle } from 'src/controllers/article.controller';
import _ from 'lodash';

// Define interface for populated comment
export interface PopulatedComment extends Omit<Comment, 'Parent' | '_comment_votes' | 'article'> {
    _id: Types.ObjectId;
    Parent?: Comment | Types.ObjectId | null;
    _comment_votes: VoteDocument[];
    article: PopulatedArticle | null;
}

const COMMENTS_FALLBACK: CommentDocument[] = dummyComments as unknown as CommentDocument[];

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name)
        private readonly commentModel: Model<CommentDocument>,
        @InjectModel(Vote.name)
        private readonly voteModel: Model<VoteDocument>,
        @Inject(forwardRef(() => ArticleService))
        private readonly articleService: ArticleService
    ) {}

    // ─── Private Helpers ────────────────────────────────────

    /**
     * Generic list‐read helper: returns real comments or fallback.
     */
    private async findCommentsWithFallback(
        filter: FilterQuery<CommentDocument>
    ): Promise<CommentDocument[]> {
        const real = await this.commentModel.find(filter).lean().exec();

        if (real.length) return real;

        // Dummy fallback: compare stringified values
        return COMMENTS_FALLBACK.filter((c) =>
            Object.entries(filter).every(([k, v]) => String((c as any)[k]) === String(v))
        );
    }

    /**
     * Generic single‐read helper: validates ID, returns real or fallback, else throws.
     */
    private async findCommentWithFallback(id: string, withVotes = false): Promise<CommentDocument> {
        if (!isObjectIdOrHexString(id)) {
            throw new BadRequestException(`Invalid comment ID "${id}"`);
        }

        // Attempt real DB lookup with optional vote population
        const query = this.commentModel.findById(id);
        if (withVotes) {
            query.populate('_comment_votes');
        }
        const doc = await query.lean().exec();
        if (doc) {
            return doc;
        }

        // Fallback to dummy data
        const fallback = COMMENTS_FALLBACK.find((c) => c._id.equals(id));
        if (fallback) {
            return fallback;
        }

        throw new NotFoundException(`Comment "${id}" not found`);
    }

    private async findOneWithFallback(
        filter: FilterQuery<CommentDocument> | string,
        isId = false
    ): Promise<Comment & { _id: Types.ObjectId }> {
        let doc: CommentDocument | null = null;

        if (isId) {
            if (!isObjectIdOrHexString(filter as string)) {
                throw new BadRequestException(`Invalid Comment ID "${filter}"`);
            }
            doc = await this.commentModel
                .findById(filter as string)
                .lean()
                .exec();
        } else {
            doc = await this.commentModel
                .findOne(filter as FilterQuery<CommentDocument>)
                .lean()
                .exec();
        }

        if (doc) return doc;

        let fallback = dummyComments.find((c) => {
            if (isId) {
                return c._id && c._id.toString() === filter;
            }
            return Object.entries(filter as object).every(
                ([k, val]) =>
                    String((c as any)[k] ?? '').toLowerCase() === String(val).toLowerCase()
            );
        });

        if (fallback) {
            if (fallback._id && fallback._comment_author) {
                return {
                    ...fallback,
                    // fallback._id is a Types.ObjectId (from your dummyComments)
                    _id: fallback._id!,
                    // preserve any existing vote array
                    _comment_votes: fallback._comment_votes || [],
                } as Comment & { _id: Types.ObjectId };
            }
        }

        const criteria = isId ? `ID "${filter}"` : JSON.stringify(filter);
        throw new NotFoundException(`No comment found for ${criteria}`);
    }

    // ─── Create ─────────────────────────────────────────────

    async createComment(data: Partial<CommentDocument>): Promise<CommentDocument> {
        if (data.Parent) {
            // Validate parent existence
            if (!isObjectIdOrHexString(data.Parent.toString())) {
                throw new BadRequestException('Invalid Parent ID');
            }
            const exists = await this.commentModel
                .exists({
                    _id: new Types.ObjectId(data.Parent),
                })
                .exec();
            if (!exists) {
                throw new NotFoundException('Parent comment not found');
            }
        }

        const created = new this.commentModel({
            ...data,
            isFeatured: data.isFeatured ?? true,
        });
        return (await created.save()).toObject();
    }

    // ─── Read ───────────────────────────────────────────────

    /** Pulls from real DB or falls back to dummyComments */
    async getAllComments(): Promise<PopulatedComment[]> {
        // 1. Fetch real or fallback raw comments
        const rawComments = await this.findCommentsWithFallback({});

        // 2. Populate each one fully
        return Promise.all(
            rawComments.map((c) =>
                // cast so TS knows c has _id
                this.populateOne(c as Comment & { _id: Types.ObjectId })
            )
        );
    }

    /** Single comment by ID (DB-first, then dummyComments) */
    async getCommentById(id: string): Promise<PopulatedComment> {
        const comment = await this.findCommentWithFallback(id);
        return this.populateOne(comment);
    }

    /** Comments filtered by article (no fallback) */
    async getCommentsByArticle(articleId: string): Promise<PopulatedComment[]> {
        if (!isObjectIdOrHexString(articleId)) {
            throw new BadRequestException('Invalid article ID');
        }

        // 1. Use your same fallback helper
        const rawComments = await this.findCommentsWithFallback({
            article: new Types.ObjectId(articleId),
        });

        // 2. Fully populate each
        return Promise.all(
            rawComments.map((c) => this.populateOne(c as Comment & { _id: Types.ObjectId }))
        );
    }

    // ─── Update ─────────────────────────────────────────────

    async updateComment(id: string, data: Partial<CommentDocument>): Promise<CommentDocument> {
        if (data.Parent) {
            throw new BadRequestException('Cannot change Parent of a comment');
        }
        if (!isObjectIdOrHexString(id)) {
            throw new BadRequestException(`Invalid comment ID "${id}"`);
        }
        const updated = await this.commentModel
            .findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
                lean: true,
            })
            .exec();
        if (!updated) {
            throw new NotFoundException(`Comment "${id}" not found`);
        }
        return updated;
    }

    // ─── Delete ─────────────────────────────────────────────

    async deleteComment(id: string): Promise<void> {
        if (!isObjectIdOrHexString(id)) {
            throw new BadRequestException(`Invalid comment ID "${id}"`);
        }
        const res = await this.commentModel.findByIdAndDelete(id).exec();
        if (!res) {
            throw new NotFoundException(`Comment "${id}" not found`);
        }
    }

    // ─── Population Helpers ────────────────────────────────────

    private async populateArrayField<T extends { _id: Types.ObjectId }>(
        ids: Types.ObjectId[],
        model: Model<any>,
        dummyData: T[]
    ): Promise<T[]> {
        const results: T[] = [];
        for (const id of ids) {
            try {
                const doc = await model.findById(id).lean().exec();
                if (doc) results.push(doc as T);
            } catch {
                // Try dummy data
                const dummy = dummyData.find((d) => d._id.equals(id));
                if (dummy) results.push(dummy);
            }
        }
        return results;
    }

    // ─── Public Population API ────────────────────────────────

    async populateOne(comment: Comment & { _id: Types.ObjectId }): Promise<PopulatedComment> {
        const { _comment_votes, Parent, article: articleRef, _id, ...rest } = comment;

        // 1. Populate Parent (unchanged)
        let populatedParent: Comment | null = null;
        if (Parent) {
            try {
                populatedParent = await this.findCommentWithFallback(Parent.toString(), true);
            } catch {
                populatedParent = null;
            }
        }

        // 2. Populate ARTICLE: always DB first
        let populatedArticle: PopulatedArticle | null = null;
        if (articleRef) {
            try {
                // Try DB
                populatedArticle = await this.articleService.getById(articleRef.toString());
            } catch {
                // If no DB record, optionally try dummy fallback? (or leave null)
                populatedArticle = null;
            }
        }

        // 3. VOTES: DB first
        let populatedVotes = await this.voteModel
            .find({ target: _id, targetType: 'Comment' })
            .lean<VoteDocument[]>()
            .exec();

        if (!Array.isArray(populatedVotes) || populatedVotes.length === 0) {
            // fallback to dummyVotes
            populatedVotes = dummyVotes
                .filter(
                    (v) => v.target?.toString() === _id.toString() && v.targetType === 'Comment'
                )
                .map((v) => ({
                    ...v,
                    _id: v._id!,
                    createdAt: v.createdAt ?? new Date(),
                    updatedAt: v.updatedAt ?? new Date(),
                })) as VoteDocument[];
        }

        return {
            ...rest,
            _id,
            Parent: populatedParent,
            article: populatedArticle,
            _comment_votes: populatedVotes,
        } as PopulatedComment;
    }

    /* Causes issues so no need to use it */
    async populateMany(raw: Array<Comment & { _id: Types.ObjectId }>): Promise<PopulatedComment[]> {
        return Promise.all(raw.map((c) => this.populateOne(c)));
    }

    // ─── Vote Toggle ────────────────────────────────────────

    async toggleVote(
        commentId: string,
        fingerprint: string,
        direction: 'up' | 'down'
    ): Promise<{ comment: PopulatedComment; changed: boolean }> {
        if (!isObjectIdOrHexString(commentId)) {
            throw new BadRequestException(`Invalid comment ID "${commentId}"`);
        }

        let comment: Comment & { _id: Types.ObjectId };
        let isDummy = false;
        let changed = false;

        // Find comment (DB or dummy) and check if it's a dummy comment
        try {
            comment = await this.findOneWithFallback(commentId, true);
            isDummy = !(await this.commentModel.exists({ _id: commentId }));
        } catch (e) {
            throw new NotFoundException(`No comment found for ID "${commentId}"`);
        }

        // Always check for existing vote in DB
        let existingVote = await this.voteModel
            .findOne({
                target: new Types.ObjectId(commentId),
                voter: fingerprint,
                targetType: 'Comment',
            })
            .lean()
            .exec();

        let updateOperation: any = {};
        if (existingVote) {
            await this.voteModel.findByIdAndDelete(existingVote._id).exec();
            updateOperation = { $pull: { _comment_votes: existingVote._id } };
            changed = true;

            // If direction is different, add new vote
            if (existingVote.direction !== direction) {
                const newVote = await this.voteModel.create({
                    voter: fingerprint,
                    targetType: 'Comment',
                    target: new Types.ObjectId(commentId),
                    direction,
                });
                updateOperation = { $push: { _comment_votes: newVote._id } };
                changed = true;
            }
        } else {
            // No existing vote, add new vote
            const newVote = await this.voteModel.create({
                voter: fingerprint,
                targetType: 'Comment',
                target: new Types.ObjectId(commentId),
                direction,
            });
            updateOperation = { $push: { _comment_votes: newVote._id } };
            changed = true;
        }

        // Only update comment's votes array if it's a DB comment
        if (!isDummy) {
            const updated = await this.commentModel
                .findByIdAndUpdate(commentId, updateOperation, {
                    new: true,
                    runValidators: true,
                    lean: true,
                })
                .exec();

            if (!updated) {
                const fallback = await this.findOneWithFallback(commentId, true);
                return { comment: await this.populateOne(fallback), changed };
            }
            return { comment: await this.populateOne(updated), changed };
        } else {
            // For dummy comments, just return the populated dummy comment (votes will be fetched from DB in populateOne)
            return { comment: await this.populateOne(comment), changed };
        }
    }
}
