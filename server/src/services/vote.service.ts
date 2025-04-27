import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vote, VoteDocument } from '../models/vote.model';

@Injectable()
export class VoteService {
    constructor(@InjectModel(Vote.name) private voteModel: Model<VoteDocument>) {}

    async createVote(data: Partial<Vote>): Promise<Vote> {
        const newVote = new this.voteModel(data);
        return newVote.save();
    }

    async getAllVotes(): Promise<Vote[]> {
        const votes = await this.voteModel.aggregate([
            // Populate target (assuming single collection reference)
            {
                $lookup: {
                    from: 'targets', // Replace with actual collection name
                    localField: 'target',
                    foreignField: '_id',
                    as: 'targetLookup',
                },
            },
            {
                $addFields: {
                    target: {
                        $cond: {
                            if: { $gt: [{ $size: '$targetLookup' }, 0] },
                            then: { $arrayElemAt: ['$targetLookup', 0] },
                            else: '$target', // Keep original ObjectID
                        },
                    },
                },
            },
            { $project: { targetLookup: 0 } },
        ]);

        return votes;
    }

    async getVoteById(id: string): Promise<Vote> {
        const [vote] = await this.voteModel.aggregate([
            { $match: { _id: new Types.ObjectId(id) } },
            // Same population logic as above
            {
                $lookup: {
                    from: 'targets', // Replace with actual collection name
                    localField: 'target',
                    foreignField: '_id',
                    as: 'targetLookup',
                },
            },
            {
                $addFields: {
                    target: {
                        $cond: {
                            if: { $gt: [{ $size: '$targetLookup' }, 0] },
                            then: { $arrayElemAt: ['$targetLookup', 0] },
                            else: '$target',
                        },
                    },
                },
            },
            { $project: { targetLookup: 0 } },
            { $limit: 1 },
        ]);
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
