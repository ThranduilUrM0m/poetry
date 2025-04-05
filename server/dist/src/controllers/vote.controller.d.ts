import { Model } from 'mongoose';
import { Vote } from '../models/vote.model';
import { VoteService } from '../services/vote.service';
import { Article, ArticleDocument } from '../models/article.model';
import { Comment, CommentDocument } from '../models/comment.model';
export type PopulatedVote = Omit<Vote, 'target'> & {
    target: Article | Comment;
};
export declare class VoteController {
    private readonly voteService;
    private readonly voteModel;
    private readonly articleModel;
    private readonly commentModel;
    constructor(voteService: VoteService, voteModel: Model<Vote>, articleModel: Model<ArticleDocument>, commentModel: Model<CommentDocument>);
    private populateField;
    private populateVote;
    createVote(data: Partial<Vote>): Promise<PopulatedVote>;
    getAllVotes(): Promise<PopulatedVote[]>;
    getVoteById(id: string): Promise<PopulatedVote>;
    updateVote(id: string, data: Partial<Vote>): Promise<PopulatedVote>;
    deleteVote(id: string): Promise<unknown>;
}
