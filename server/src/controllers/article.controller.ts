import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    NotFoundException,
    HttpException,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Article } from '../models/article.model';

import { User, UserDocument } from '../models/user.model';
import { Comment, CommentDocument } from '../models/comment.model';
import { View, ViewDocument } from '../models/view.model';
import { Vote, VoteDocument } from '../models/vote.model';
import { ArticleService } from '../services/article.service';
import {
    dummyArticles,
    dummyUsers,
    dummyComments,
    dummyViews,
    dummyVotes,
} from '../data/dummyData';

// Define a new type representing an Article with populated fields.
export type PopulatedArticle = Omit<Article, 'author' | 'comments' | 'votes' | 'views'> & {
    author: UserDocument;
    comments: CommentDocument[];
    votes: VoteDocument[];
    views: ViewDocument[];
};

@Controller('api/articles')
export class ArticleController {
    constructor(
        private readonly articleService: ArticleService,
        @InjectModel(Article.name) private readonly articleModel: Model<Article>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
        @InjectModel(View.name) private readonly viewModel: Model<ViewDocument>,
        @InjectModel(Vote.name) private readonly voteModel: Model<VoteDocument>
    ) {}

    /**
     * Helper: Populates a single field by querying the database first,
     * and falling back to dummy data if no record is found.
     *
     * The generic type T is constrained to objects having an _id.
     */
    private async populateField<T extends { _id: Types.ObjectId | string }>(
        id: Types.ObjectId,
        model: Model<T>,
        dummyData: T[]
    ): Promise<T> {
        const doc = await model.findById(id).lean().exec();
        if (doc) {
            return doc as T;
        }
        const fallback = dummyData.find((item) => item._id.toString() === id.toString());
        if (fallback) {
            return fallback;
        }
        throw new NotFoundException(`Unable to populate field for id ${id.toString()}`);
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
                const item = await this.populateField<T>(id, model, dummyData);
                results.push(item);
            } catch (error) {
                console.log(error);
            }
        }
        return results;
    }

    /**
     * Helper: Returns a fully populated article.
     */
    private async populateArticle(article: Article): Promise<PopulatedArticle> {
        const populatedArticle: PopulatedArticle = {
            ...article,
            author: {} as UserDocument,
            comments: [],
            votes: [],
            views: [],
        };

        // Populate author (if stored as ObjectId).
        if (article.author instanceof Types.ObjectId) {
            populatedArticle.author = await this.populateField<UserDocument>(
                article.author,
                this.userModel,
                dummyUsers as UserDocument[]
            );
        } else {
            populatedArticle.author = article.author as unknown as UserDocument;
        }

        // Populate comments.
        if (article.comments && Array.isArray(article.comments)) {
            populatedArticle.comments = await this.populateArrayField<CommentDocument>(
                article.comments,
                this.commentModel,
                dummyComments as CommentDocument[]
            );
        }

        // Populate votes.
        if (article.votes && Array.isArray(article.votes)) {
            populatedArticle.votes = await this.populateArrayField<VoteDocument>(
                article.votes,
                this.voteModel,
                dummyVotes as VoteDocument[]
            );
        }

        // Populate views.
        if (article.views && Array.isArray(article.views)) {
            populatedArticle.views = await this.populateArrayField<ViewDocument>(
                article.views,
                this.viewModel,
                dummyViews as ViewDocument[]
            );
        }

        return populatedArticle;
    }

    @Post()
    async createArticle(@Body() data: Partial<Article>): Promise<Article> {
        return this.articleService.createArticle(data);
    }

    @Get()
    async getAllArticles(): Promise<PopulatedArticle[]> {
        const articlesFromDb = await this.articleService.getAllArticles();
        if (articlesFromDb.length > 0) {
            return Promise.all(articlesFromDb.map((article) => this.populateArticle(article)));
        } else {
            // Fallback to dummy data if no records exist.
            return Promise.all(
                dummyArticles.map(async (article) => this.populateArticle(article as Article))
            );
        }
    }

    @Get(':category')
    async getArticlesByCategory(@Param('category') category: string): Promise<PopulatedArticle[]> {
        const articlesFromDb = await this.articleService.getArticleByCategory(category);
        if (articlesFromDb.length > 0) {
            return Promise.all(articlesFromDb.map((article) => this.populateArticle(article)));
        }
        const filteredDummy = dummyArticles.filter(
            (article) => article.category?.toLowerCase() === category.toLowerCase()
        );
        if (filteredDummy.length === 0) {
            throw new NotFoundException('No articles found for this category');
        }
        return Promise.all(
            filteredDummy.map(async (article) => this.populateArticle(article as Article))
        );
    }

    @Get(':category/:slug')
    async getArticleBySlug(
        @Param('category') category: string,
        @Param('slug') slug: string
    ): Promise<PopulatedArticle> {
        const articleFromDb = await this.articleService.findBySlug(category, slug);
        if (articleFromDb) {
            return this.populateArticle(articleFromDb);
        }
        const dummyArticle = dummyArticles.find(
            (a) => a.category?.toLowerCase() === category.toLowerCase() && a.slug === slug
        );
        if (!dummyArticle) {
            throw new NotFoundException('Article not found');
        }
        return this.populateArticle(dummyArticle as Article);
    }

    @Patch(':identifier')
    async updateArticle(
        @Param('identifier') identifier: string,
        @Body() data: Partial<Article>
    ): Promise<PopulatedArticle> {
        // Check if the identifier is a valid MongoDB ObjectId
        if (Types.ObjectId.isValid(identifier)) {
            try {
                // Attempt to update by ID
                const updated = await this.articleService.updateArticleById(identifier, data);
                return this.populateArticle(updated);
            } catch (error) {
                // If ID is valid but not found, throw error (don't fallback to slug)
                throw new NotFoundException('Article not found by ID');
            }
        } else {
            // Treat as slug and update by slug
            const updated = await this.articleService.updateArticleBySlug(identifier, data);
            return this.populateArticle(updated);
        }
    }

    @Patch()
    async updateArticles(@Body() data: Partial<Article>[]): Promise<PopulatedArticle[]> {
        const updatedArticles = await this.articleService.updateArticles(data);
        return Promise.all(updatedArticles.map((article) => this.populateArticle(article)));
    }

    @Delete(':identifier')
    async deleteArticle(@Param('identifier') identifier: string): Promise<{ message: string }> {
        if (Types.ObjectId.isValid(identifier)) {
            // Identifier looks like an ObjectId → delete by ID
            try {
                await this.articleService.deleteArticleById(identifier);
                return { message: `Deleted article ${identifier}` };
            } catch (err) {
                if (err instanceof NotFoundException) {
                    throw err;
                }
                throw new BadRequestException('Invalid article ID');
            }
        } else {
            // Otherwise treat as slug
            try {
                await this.articleService.deleteArticleBySlug(identifier);
                return { message: `Deleted article "${identifier}"` };
            } catch (err) {
                if (err instanceof NotFoundException) {
                    throw err;
                }
                throw new BadRequestException('Invalid slug');
            }
        }
    }

    @Post(':id/views')
    async trackView(
        @Param('id') id: string,
        @Body() body: { fingerprint: string }
    ): Promise<PopulatedArticle> {
        try {
            const exists = await this.articleModel
                .exists({ _id: id, 'views._viewer': body.fingerprint })
                .lean()
                .exec();
            if (!exists) {
                const view = await this.viewModel.create({
                    _viewer: body.fingerprint,
                    article: new Types.ObjectId(id),
                });
                const updatedArticle = await this.articleModel
                    .findByIdAndUpdate(
                        new Types.ObjectId(id),
                        { $push: { views: view._id } },
                        { new: true, lean: true }
                    )
                    .exec();
                if (!updatedArticle) {
                    const dummyArticle = dummyArticles.find((a) => a._id?.toString() === id);
                    if (dummyArticle) {
                        return this.populateArticle(dummyArticle as Article);
                    }
                    throw new NotFoundException('Article not found');
                }
                return this.populateArticle(updatedArticle);
            }
            const article = await this.articleModel.findById(id).lean().exec();
            if (!article) {
                const dummyArticle = dummyArticles.find((a) => a._id?.toString() === id);
                if (dummyArticle) {
                    return this.populateArticle(dummyArticle as Article);
                }
                throw new NotFoundException('Article not found');
            }
            return this.populateArticle(article);
        } catch (error) {
            console.error(error);
            throw new HttpException('Failed to track view', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post(':id/vote')
    async vote(
        @Param('id') id: string,
        @Body() body: { fingerprint: string; direction: 'up' | 'down' }
    ): Promise<PopulatedArticle> {
        return this.toggleVote(id, body.fingerprint, body.direction);
    }

    /**
     * Helper: Handles vote toggling logic for an article.
     */
    private async toggleVote(
        id: string,
        fingerprint: string,
        direction: 'up' | 'down'
    ): Promise<PopulatedArticle> {
        try {
            // Check if the article exists in the database
            const article = await this.articleModel.findById(id).lean().exec();

            if (!article) {
                // Handle dummy data case: Article is not in the database
                const dummyArticle = dummyArticles.find((a) => a._id?.toString() === id);
                if (dummyArticle) {
                    // Check if a vote exists in the dummy data
                    const existingDummyVote = dummyVotes.find(
                        (vote) => vote.target?.toString() === id && vote.voter === fingerprint
                    );

                    // If a vote exists in dummy data, do nothing (since dummy data is immutable)
                    if (existingDummyVote) {
                        console.log('Vote exists in dummy data, no changes will be made.');
                        return this.populateArticle(dummyArticle as Article);
                    }

                    // If no vote exists in dummy data, create the vote in the database
                    await this.voteModel.create({
                        voter: fingerprint,
                        targetType: 'Article',
                        target: new Types.ObjectId(id), // Use the article ID from dummy data
                        direction,
                    });

                    // Return the dummy article as it is
                    return this.populateArticle(dummyArticle as Article);
                }

                throw new NotFoundException('Article not found');
            }

            // Handle database case: Article exists in the database
            const existingVote = await this.voteModel
                .findOne({ target: new Types.ObjectId(id), voter: fingerprint })
                .exec();

            let update: Record<string, unknown>;

            if (existingVote) {
                if (existingVote.direction === direction) {
                    // Remove the vote if the direction matches
                    await this.voteModel.findByIdAndDelete(existingVote._id).exec();
                    update = { $pull: { votes: existingVote._id } };
                } else {
                    // Update the vote direction
                    await this.voteModel.findByIdAndDelete(existingVote._id).exec();
                    update = { $pull: { votes: existingVote._id } };

                    const newVote = await this.voteModel.create({
                        voter: fingerprint,
                        targetType: 'Article',
                        target: new Types.ObjectId(id),
                        direction,
                    });
                    update = { $push: { votes: newVote._id } };
                }
            } else {
                // Create a new vote
                const newVote = await this.voteModel.create({
                    voter: fingerprint,
                    targetType: 'Article',
                    target: new Types.ObjectId(id),
                    direction,
                });
                update = { $push: { votes: newVote._id } };
            }

            // Update the article in the database
            const updatedArticle = await this.articleModel
                .findByIdAndUpdate(new Types.ObjectId(id), update, { new: true, lean: true })
                .exec();

            if (!updatedArticle) {
                throw new NotFoundException('Article not found after update');
            }

            return this.populateArticle(updatedArticle);
        } catch (error) {
            console.error(error);
            throw new HttpException('Failed to process vote', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
