import { Controller, Get, Post, Patch, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vote } from '../models/vote.model';
import { VoteService } from '../services/vote.service';
import { dummyVotes, dummyArticles, dummyComments } from '../data/dummyData';
import { Article, ArticleDocument } from '../models/article.model';
import { Comment, CommentDocument } from '../models/comment.model';

// Define a type representing a Vote with the target field populated.
export type PopulatedVote = Omit<Vote, 'target'> & { target: Article | Comment };

@Controller('api/votes')
export class VoteController {
    constructor(
        private readonly voteService: VoteService,
        @InjectModel(Vote.name) private readonly voteModel: Model<Vote>,
        @InjectModel(Article.name) private readonly articleModel: Model<ArticleDocument>,
        @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>
    ) {}

    /**
     * Generic helper: Populates a single field by querying the database first
     * and falling back to dummy data if no record is found.
     * The generic type T must include an _id property.
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
     * Helper: Returns a fully populated vote.
     * This method populates the 'target' field based on the vote's targetType.
     */
    private async populateVote(vote: Vote): Promise<PopulatedVote> {
        const populatedVote: PopulatedVote = { ...vote, target: {} as Article | Comment };

        if (vote.targetType === 'Article') {
            const article = await this.populateField<ArticleDocument>(
                vote.target,
                this.articleModel,
                dummyArticles as ArticleDocument[]
            );
            populatedVote.target = article; // Assign the populated Article
        } else if (vote.targetType === 'Comment') {
            const comment = await this.populateField<CommentDocument>(
                vote.target,
                this.commentModel,
                dummyComments as CommentDocument[]
            );
            populatedVote.target = comment; // Assign the populated Comment
        } else {
            throw new NotFoundException('Invalid target type');
        }

        return populatedVote;
    }

    @Post()
    async createVote(@Body() data: Partial<Vote>): Promise<PopulatedVote> {
        if (!data.targetType || !data.target) {
            throw new NotFoundException('Target type and target ID must be provided');
        }
        const newVote = await this.voteService.createVote(data);
        return this.populateVote(newVote);
    }

    @Get()
    async getAllVotes(): Promise<PopulatedVote[]> {
        const votesFromDb = await this.voteService.getAllVotes();
        if (votesFromDb.length > 0) {
            return Promise.all(votesFromDb.map((vote) => this.populateVote(vote)));
        }
        return Promise.all((dummyVotes as Vote[]).map(async (vote) => this.populateVote(vote)));
    }

    @Get(':id')
    async getVoteById(@Param('id') id: string): Promise<PopulatedVote> {
        const voteFromDb = await this.voteService.getVoteById(id);
        if (voteFromDb) {
            return this.populateVote(voteFromDb);
        }
        const dummyVote = dummyVotes.find((a) => a._id?.toString() === id);
        if (!dummyVote) {
            throw new NotFoundException('Vote not found');
        }
        return this.populateVote(dummyVote as Vote);
    }

    @Patch(':id')
    async updateVote(@Param('id') id: string, @Body() data: Partial<Vote>): Promise<PopulatedVote> {
        const updatedVote = await this.voteService.updateVote(id, data);
        return this.populateVote(updatedVote);
    }

    @Delete(':id')
    async deleteVote(@Param('id') id: string): Promise<unknown> {
        return this.voteService.deleteVote(id);
    }
}
