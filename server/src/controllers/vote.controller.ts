// src/controllers/vote.controller.ts

import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { VoteService } from '../services/vote.service';
import { Vote } from '../models/vote.model';
import { ArticleService } from '../services/article.service';
import { CommentService } from '../services/comment.service';
import { Article } from '../models/article.model';
import { Comment } from '../models/comment.model';
import { dummyVotes, dummyArticles, dummyComments } from '../data/dummyData';

type LoaderFn<T> = (id: string) => Promise<T>;
export type PopulatedVote = Omit<Vote, 'target'> & {
    target: Article | Comment;
};

@Controller('api/votes')
export class VoteController {
    constructor(
        private readonly voteService: VoteService,
        private readonly articleService: ArticleService,
        private readonly commentService: CommentService
    ) {}

    private async populateField<T>(
        id: Types.ObjectId,
        loaderFn: LoaderFn<T>,
        dummyData: (T & { _id?: Types.ObjectId })[]
    ): Promise<T> {
        try {
            return await loaderFn(id.toString());
        } catch (err) {
            if (err instanceof NotFoundException) {
                const fallback = dummyData.find((d) => d._id?.toString() === id.toString());
                if (fallback) return fallback as T;
            }
            throw err;
        }
    }

    private async populateVote(vote: Vote): Promise<PopulatedVote> {
        if (!vote.target || !vote.targetType) {
            throw new BadRequestException('Missing target info');
        }

        const targetId =
            vote.target instanceof Types.ObjectId
                ? vote.target
                : new Types.ObjectId(vote.target as any);

        let populated: Article | Comment;
        if (vote.targetType === 'Article') {
            populated = await this.populateField(
                targetId,
                this.articleService.getById.bind(this.articleService),
                dummyArticles as Article[]
            );
        } else {
            populated = await this.populateField(
                targetId,
                this.commentService.getCommentById.bind(this.commentService),
                dummyComments as Comment[]
            );
        }

        return { ...vote, target: populated };
    }

    @Post()
    async createVote(@Body() data: Partial<Vote>): Promise<PopulatedVote> {
        const newVote = await this.voteService.createVote(data);
        return this.populateVote(newVote);
    }

    @Get()
    async getAllVotes(): Promise<PopulatedVote[]> {
        const votes = await this.voteService.getAllVotes();
        if (votes.length) {
            return Promise.all(votes.map((v) => this.populateVote(v)));
        }
        return Promise.all((dummyVotes as Vote[]).map((v) => this.populateVote(v as Vote)));
    }

    @Get(':id')
    async getVoteById(@Param('id') id: string): Promise<PopulatedVote> {
        const vote = await this.voteService.getVoteById(id);
        return this.populateVote(vote);
    }

    @Patch(':id')
    async updateVote(@Param('id') id: string, @Body() data: Partial<Vote>): Promise<PopulatedVote> {
        const updated = await this.voteService.updateVote(id, data);
        return this.populateVote(updated);
    }

    @Delete(':id')
    async deleteVote(@Param('id') id: string): Promise<{ message: string }> {
        return this.voteService.deleteVote(id);
    }
}
