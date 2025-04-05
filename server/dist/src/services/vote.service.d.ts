import { Model } from 'mongoose';
import { Vote, VoteDocument } from '../models/vote.model';
export declare class VoteService {
    private voteModel;
    constructor(voteModel: Model<VoteDocument>);
    createVote(data: Partial<Vote>): Promise<Vote>;
    getAllVotes(): Promise<Vote[]>;
    getVoteById(id: string): Promise<Vote>;
    deleteVote(id: string): Promise<{
        message: string;
    }>;
    updateVote(id: string, data: Partial<Vote>): Promise<Vote>;
}
