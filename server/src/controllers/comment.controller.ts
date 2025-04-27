/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Headers,
    Body,
    NotFoundException,
    HttpException,
    HttpStatus,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FlattenMaps } from 'mongoose';
import { Comment } from '../models/comment.model';

import { Article, ArticleDocument } from '../models/article.model';
import { Vote, VoteDocument } from '../models/vote.model';
import { CommentService } from '../services/comment.service';
import { dummyArticles, dummyComments, dummyVotes } from '../data/dummyData';
import { JwtService } from '@nestjs/jwt';

// Define a type representing a Comment with its article field populated.
export type PopulatedComment = Omit<Comment, 'article' | '_comment_votes' | 'Parent'> & {
    article: ArticleDocument;
    _comment_votes: VoteDocument[];
    Parent?: Comment | Types.ObjectId | null;
};

@Controller('api/comments')
export class CommentController {
    constructor(
        private readonly commentService: CommentService,
        private readonly jwtService: JwtService,
        @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
        @InjectModel(Article.name) private readonly articleModel: Model<ArticleDocument>,
        @InjectModel(Vote.name) private readonly voteModel: Model<VoteDocument>
    ) {}

    /**
     * Helper: Populates a single field by querying the database first,
     * and falling back to dummy data if no record is found.
     */
    private async populateField<T extends { _id: Types.ObjectId | string }>(
        id: Types.ObjectId,
        model: Model<T>,
        dummyData: T[]
    ): Promise<T | null> {
        try {
            const doc = await model.findById(id).lean().exec();
            if (doc) {
                return doc as T;
            }
            // Ensure proper type safety when comparing IDs
            const targetId = id.toString();
            const fallback = dummyData.find((item) => {
                // Handle both string and ObjectId _id fields
                const itemId = typeof item._id === 'string' ? item._id : item._id.toString();
                return itemId === targetId;
            });

            return fallback || null;
        } catch (error) {
            console.warn(`Failed to populate field for id ${id.toString()}:`, error);
            return null;
        }
    }

    /**
     * Helper: Populates an array of ObjectID fields.
     */
    private async populateArrayField<T extends { _id: Types.ObjectId | string }>(
        ids: Types.ObjectId[],
        model: Model<T>,
        dummyData: T[]
    ): Promise<T[]> {
        const results: T[] = [];

        for (const id of ids) {
            try {
                // Ensure id is a valid ObjectId
                const validId = typeof id === 'string' ? new Types.ObjectId(id) : id;
                const item = await this.populateField<T>(validId, model, dummyData);
                if (item) {
                    results.push(item);
                }
            } catch (error) {
                // Safely convert id to string regardless of its type
                const idString = id instanceof Types.ObjectId ? id.toString() : String(id);
                console.warn(`Failed to populate array field for id ${idString}:`, error);
                continue;
            }
        }

        return results;
    }

    /**
     * Helper: Returns a fully populated comment.
     */
    private async populateComment(comment: Comment): Promise<PopulatedComment> {
        const populatedComment: PopulatedComment = {
            ...comment,
            // Keep original Parent and article values (ObjectIds) for population
            Parent: comment.Parent ? comment.Parent : null,
            article: comment.article ? comment.article : null,
            _comment_votes: [],
          } as unknown as PopulatedComment; // Temporary type assertion

        try {
            // Populate Parent field
            if (comment.Parent) {
                try {
                    // Safely convert Parent to ObjectId
                    const parentId = typeof comment.Parent === 'string'
                        ? new Types.ObjectId(comment.Parent)
                        : comment.Parent instanceof Types.ObjectId
                            ? comment.Parent
                            : new Types.ObjectId((comment.Parent as any)._id || comment.Parent);
    
                    // Explicitly type the lean document
                    type LeanComment = FlattenMaps<Comment> &
                        Required<{ _id: Types.ObjectId }> & { __v: number };
    
                    let populatedParent: LeanComment | null = await this.commentModel
                        .findById(parentId)
                        .lean()
                        .exec();
    
                    if (!populatedParent) {
                        // If not found in database, look in dummy data
                        const dummyParent = dummyComments.find(
                            (c) => c._id?.toString() === parentId.toString()
                        );
    
                        if (dummyParent) {
                            // Convert dummy parent to lean format
                            populatedParent = {
                                ...dummyParent,
                                _id: parentId,
                                __v: 0,
                            } as LeanComment;
                        }
                    }
    
                    if (populatedParent) {
                        populatedComment.Parent = populatedParent as unknown as Comment;
                    }
                } catch (error) {
                    console.warn('Invalid Parent ID format:', error);
                    populatedComment.Parent = null;
                }
            }

            // Populate article field
            if (comment.article) {
                try {
                    // Add debug logging
                    console.log('Article before population:', comment.article);
            
                    // Handle different article ID formats
                    const articleId = typeof comment.article === 'string'
                        ? new Types.ObjectId(comment.article)
                        : comment.article instanceof Types.ObjectId
                            ? comment.article
                            : new Types.ObjectId(
                                (comment.article as ArticleDocument)?._id?.toString() || (comment.article as string | Types.ObjectId).toString()
                            );
            
                    console.log('Article ID after conversion:', articleId.toString());
            
                    // Try to find in database first
                    let populatedArticle = await this.articleModel
                        .findById(articleId)
                        .lean()
                        .exec();
            
                    console.log('Found in database:', !!populatedArticle);
            
                    if (!populatedArticle) {
                        // If not found in database, look in dummy data
                        const dummyArticle = dummyArticles.find(
                            (a) => a._id?.toString() === articleId.toString()
                        );
            
                        console.log('Found in dummy data:', !!dummyArticle);
            
                        if (dummyArticle) {
                            populatedArticle = {
                                ...dummyArticle,
                                _id: articleId,
                                __v: 0,
                            } as unknown as FlattenMaps<ArticleDocument> & Required<{ _id: Types.ObjectId }> & { __v: number };
                        }
                    }
            
                    if (populatedArticle) {
                        populatedComment.article = populatedArticle;
                    } else {
                        console.warn(`No article found for ID: ${articleId}`);
                        // Set to null instead of empty object
                        populatedComment.article = null as any;
                    }
                } catch (error) {
                    console.error('Error populating article:', error);
                    console.debug('Original article value:', comment.article);
                    populatedComment.article = null as any;
                }
            }

            // Handle votes population
            if (Array.isArray(comment._comment_votes) && comment._comment_votes.length > 0) {
                const voteIds = comment._comment_votes.map((v) =>
                    v instanceof Types.ObjectId ? v : new Types.ObjectId((v as string).toString())
                );

                const votes = await Promise.all(
                    voteIds.map(async (voteId) => {
                        const vote = await this.voteModel.findById(voteId).lean().exec();
                        if (vote) return vote;
                        // Look in dummy votes if not found in database
                        return dummyVotes.find((v) => v._id?.toString() === voteId.toString());
                    })
                );

                populatedComment._comment_votes = votes.filter(
                    (v): v is VoteDocument => v !== undefined
                );
            }

            return populatedComment;
        } catch (error) {
            console.error('Error populating comment:', error);
            return populatedComment; // Return with basic population
        }
    }

    @Post()
    async createComment(@Body() data: Partial<Comment>): Promise<Comment> {
        if (data.article && typeof data.article === 'string') {
            data.article = new Types.ObjectId(data.article);
        }
        if (data.Parent) {
            const parentId = data.Parent.toString();
            const parentExists = await this.commentService.commentExists(parentId);
            if (!parentExists) {
                throw new NotFoundException('Parent comment not found');
            }
        }
        const newComment = new this.commentModel({
            ...data,
            isFeatured: data.isFeatured || true,
        });
        return newComment.save();
    }

    @Get()
    async getAllComments(): Promise<PopulatedComment[]> {
        try {
            const commentsFromDb = await this.commentService.getAllComments();
            console.log('Retrieving :', commentsFromDb.filter((c) => {return c.article}));

            // Ensure we have comments
            if (!commentsFromDb) {
                return Promise.all(
                    dummyComments.map((comment) => this.populateComment(comment as Comment))
                );
            }

            // Handle empty array case
            if (commentsFromDb.length === 0) {
                return Promise.all(
                    dummyComments.map((comment) => this.populateComment(comment as Comment))
                );
            }

            // Populate comments with error handling
            const populatedComments = await Promise.all(
                commentsFromDb.map(async (comment) => {
                    try {
                        return await this.populateComment(comment);
                    } catch (error) {
                        console.error(`Error populating comment:`, error);
                        return null;
                    }
                })
            );

            // Filter out any null results from failed populations
            return populatedComments.filter(
                (comment): comment is PopulatedComment => comment !== null
            );
        } catch (error) {
            console.error('Error in getAllComments controller:', error);
            throw new HttpException('Failed to fetch comments', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async getCommentById(@Param('id') id: string): Promise<PopulatedComment> {
        const commentFromDb = await this.commentService.getCommentById(id);
        if (commentFromDb) {
            return this.populateComment(commentFromDb);
        }
        const dummyComment = dummyComments.find((a) => a._id?.toString() === id);
        if (!dummyComment) {
            throw new NotFoundException('Comment not found');
        }
        return this.populateComment(dummyComment as Comment);
    }

    /**
     * GET /api/comments/article/:id
     * Retrieves comments for a given article.
     * First, it tries to load from the database; if none are found, it falls back to dummy data.
     */
    @Get('article/:id')
    async fetchCommentsByArticle(@Param('id') id: string): Promise<PopulatedComment[]> {
        // Attempt to get comments from the database
        const commentsFromDb = await this.commentService.getCommentsByArticle(id);

        // Return empty array if no comments found, don't throw error
        if (!commentsFromDb || commentsFromDb.length === 0) {
            return [];
        }

        return Promise.all(commentsFromDb.map((comment) => this.populateComment(comment)));
    }

    @Put(':id')
    async updateComment(
        @Param('id') id: string,
        @Body() data: Partial<Comment>
    ): Promise<PopulatedComment> {
        if (data.Parent) {
            throw new BadRequestException('Cannot change comment parent');
        }
        const updatedComment = await this.commentService.updateComment(id, data);
        return this.populateComment(updatedComment);
    }

    @Delete(':id')
    async deleteComment(
        @Param('id') id: string,
        @Headers('authorization') authHeader?: string,
        @Headers('x-comment-fingerprint') fingerprint?: string
    ) {
        const comment = await this.commentService.getCommentById(id);
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        // If there's an auth header, it's the admin
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                // Just verify the token is valid
                const payload = this.jwtService.verify(token);
                if (payload) {
                    // Token is valid, allow deletion
                    return this.commentService.deleteComment(id);
                }
            } catch (error) {
                throw new UnauthorizedException('Invalid token');
            }
        }

        // If not admin (no auth header), check fingerprint
        if (fingerprint && comment._comment_fingerprint === fingerprint) {
            return this.commentService.deleteComment(id);
        }

        throw new UnauthorizedException('Unauthorized to delete this comment');
    }

    @Post(':id/vote')
    async vote(
        @Param('id') id: string,
        @Body() body: { fingerprint: string; direction: 'up' | 'down' }
    ): Promise<PopulatedComment> {
        const { fingerprint, direction } = body;
        return this.toggleVote(id, fingerprint, direction);
    }

    /**
     * Helper: Handles vote toggling logic for an Comment.
     */
    private async toggleVote(
        id: string,
        fingerprint: string,
        direction: 'up' | 'down'
    ): Promise<PopulatedComment> {
        try {
            // Check if the comment exists in the database
            const comment = await this.commentModel.findById(id).lean().exec();

            if (!comment) {
                // Handle dummy data case: Comment is not in the database
                const dummyComment = dummyComments.find((a) => a._id?.toString() === id);
                if (dummyComment) {
                    // Check if a vote exists in the dummy data
                    const existingDummyVote = dummyVotes.find(
                        (vote) => vote.target?.toString() === id && vote.voter === fingerprint
                    );

                    // If a vote exists in dummy data, do nothing (since dummy data is immutable)
                    if (existingDummyVote) {
                        return this.populateComment(dummyComment as Comment);
                    }

                    // If no vote exists in dummy data, create the vote in the database
                    await this.voteModel.create({
                        voter: fingerprint,
                        targetType: 'Comment',
                        target: new Types.ObjectId(id), // Use the comment ID from dummy data
                        direction,
                    });

                    // Return the dummy comment as it is
                    return this.populateComment(dummyComment as Comment);
                }

                throw new NotFoundException('Comment not found');
            }

            // Handle database case: Comment exists in the database
            const existingVote = await this.voteModel
                .findOne({ target: new Types.ObjectId(id), voter: fingerprint })
                .exec();

            let update: Record<string, unknown>;

            if (existingVote) {
                if (existingVote.direction === direction) {
                    // Remove the vote if the direction matches
                    await this.voteModel.findByIdAndDelete(existingVote._id).exec();
                    update = { $pull: { _comment_votes: existingVote._id } };
                } else {
                    // Update the vote direction
                    await this.voteModel.findByIdAndDelete(existingVote._id).exec();
                    update = { $pull: { _comment_votes: existingVote._id } };

                    const newVote = await this.voteModel.create({
                        voter: fingerprint,
                        targetType: 'Comment',
                        target: new Types.ObjectId(id),
                        direction,
                    });
                    update = { $push: { _comment_votes: newVote._id } };
                }
            } else {
                // Create a new vote
                const newVote = await this.voteModel.create({
                    voter: fingerprint,
                    targetType: 'Comment',
                    target: new Types.ObjectId(id),
                    direction,
                });
                update = { $push: { _comment_votes: newVote._id } };
            }

            // Update the comment in the database
            const updatedComment = await this.commentModel
                .findByIdAndUpdate(new Types.ObjectId(id), update, { new: true, lean: true })
                .exec();

            if (!updatedComment) {
                throw new NotFoundException('Comment not found after update');
            }

            return this.populateComment(updatedComment);
        } catch (error) {
            console.error(error);
            throw new HttpException('Failed to process vote', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
