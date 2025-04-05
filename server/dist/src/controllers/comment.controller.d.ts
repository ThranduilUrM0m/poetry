import { Model } from 'mongoose';
import { Comment } from '../models/comment.model';
import { ArticleDocument } from '../models/article.model';
import { VoteDocument } from '../models/vote.model';
import { CommentService } from '../services/comment.service';
export type PopulatedComment = Omit<Comment, 'article' | '_comment_votes'> & {
    article: ArticleDocument;
    _comment_votes: VoteDocument[];
};
export declare class CommentController {
    private readonly commentService;
    private readonly commentModel;
    private readonly articleModel;
    private readonly voteModel;
    constructor(commentService: CommentService, commentModel: Model<Comment>, articleModel: Model<ArticleDocument>, voteModel: Model<VoteDocument>);
    private populateField;
    private populateArrayField;
    private populateComment;
    createComment(data: Partial<Comment>): Promise<Comment>;
    getAllComments(): Promise<PopulatedComment[]>;
    getCommentById(id: string): Promise<PopulatedComment>;
    fetchCommentsByArticle(id: string): Promise<PopulatedComment[]>;
    updateComment(id: string, data: Partial<Comment>): Promise<PopulatedComment>;
    deleteComment(id: string, fingerprint: string): Promise<{
        message: string;
    }>;
    vote(id: string, body: {
        fingerprint: string;
        direction: 'up' | 'down';
    }): Promise<PopulatedComment>;
    private toggleVote;
}
