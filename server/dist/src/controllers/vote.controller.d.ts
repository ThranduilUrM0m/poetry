import { VoteService } from '../services/vote.service';
import { Vote } from '../models/vote.model';
import { ArticleService } from '../services/article.service';
import { CommentService } from '../services/comment.service';
import { Article } from '../models/article.model';
import { Comment } from '../models/comment.model';
export type PopulatedVote = Omit<Vote, 'target'> & {
    target: Article | Comment;
};
export declare class VoteController {
    private readonly voteService;
    private readonly articleService;
    private readonly commentService;
    constructor(voteService: VoteService, articleService: ArticleService, commentService: CommentService);
    private populateField;
    private populateVote;
    createVote(data: Partial<Vote>): Promise<PopulatedVote>;
    getAllVotes(): Promise<PopulatedVote[]>;
    getVoteById(id: string): Promise<PopulatedVote>;
    updateVote(id: string, data: Partial<Vote>): Promise<PopulatedVote>;
    deleteVote(id: string): Promise<{
        message: string;
    }>;
}
