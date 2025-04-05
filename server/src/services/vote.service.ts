import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vote, VoteDocument } from '../models/vote.model';

@Injectable()
export class VoteService {
    constructor(@InjectModel(Vote.name) private voteModel: Model<VoteDocument>) {}

    async createVote(data: Partial<Vote>): Promise<Vote> {
        const newVote = new this.voteModel(data);
        return newVote.save();
    }

    async getAllVotes(): Promise<Vote[]> {
        const votes = await this.voteModel.find().populate('target');
        return votes;
    }

    async getVoteById(id: string): Promise<Vote> {
        const vote = await this.voteModel.findById(id).populate('target');
        if (!vote) throw new NotFoundException('Vote not found');
        return vote;
    }

    async deleteVote(id: string): Promise<{ message: string }> {
        const vote = await this.voteModel.findByIdAndDelete(id);
        if (!vote) throw new NotFoundException('Vote not found');
        return { message: 'Vote deleted successfully' };
    }

    async updateVote(id: string, data: Partial<Vote>): Promise<Vote> {
        const vote = await this.voteModel.findByIdAndUpdate(id, data, { new: true });
        if (!vote) throw new NotFoundException('Vote not found');
        return vote;
    }
}
