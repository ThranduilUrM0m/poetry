import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../models/comment.model';
export declare class CommentService {
    private commentModel;
    constructor(commentModel: Model<CommentDocument>);
    getCommentsWithArticleTitle(): Promise<Comment[]>;
}
