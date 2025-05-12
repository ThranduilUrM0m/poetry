import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from '../models/comment.model';
import { VoteDocument } from '../models/vote.model';
import { ArticleService } from './article.service';
import { PopulatedArticle } from 'src/controllers/article.controller';
export interface PopulatedComment extends Omit<Comment, 'Parent' | '_comment_votes' | 'article'> {
    _id: Types.ObjectId;
    Parent?: Comment | Types.ObjectId | null;
    _comment_votes: VoteDocument[];
    article: PopulatedArticle | null;
}
export declare class CommentService {
    private readonly commentModel;
    private readonly voteModel;
    private readonly articleService;
    constructor(commentModel: Model<CommentDocument>, voteModel: Model<VoteDocument>, articleService: ArticleService);
    private findCommentsWithFallback;
    private findCommentWithFallback;
    private findOneWithFallback;
    createComment(data: Partial<CommentDocument>): Promise<CommentDocument>;
    getAllComments(): Promise<PopulatedComment[]>;
    getCommentById(id: string): Promise<PopulatedComment>;
    getCommentsByArticle(articleId: string): Promise<PopulatedComment[]>;
    updateComment(id: string, data: Partial<CommentDocument>): Promise<CommentDocument>;
    deleteComment(id: string): Promise<void>;
    private populateArrayField;
    populateOne(comment: Comment & {
        _id: Types.ObjectId;
    }): Promise<PopulatedComment>;
    populateMany(raw: Array<Comment & {
        _id: Types.ObjectId;
    }>): Promise<PopulatedComment[]>;
    toggleVote(commentId: string, fingerprint: string, direction: 'up' | 'down'): Promise<{
        comment: PopulatedComment;
        changed: boolean;
    }>;
}
