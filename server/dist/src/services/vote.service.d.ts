import { Model } from 'mongoose';
import { Vote, VoteDocument } from '../models/vote.model';
export declare class VoteService {
    private readonly voteModel;
    constructor(voteModel: Model<VoteDocument>);
    private validateId;
    private getByIdOrThrow;
    private findOneWithFallback;
    createVote(data: Partial<Vote>): Promise<Vote>;
    getAllVotes(): Promise<Vote[]>;
    getVoteById(id: string): Promise<Vote>;
    updateVote(id: string, data: Partial<Vote>): Promise<Vote>;
    deleteVote(id: string): Promise<{
        message: string;
    }>;
}
