import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from '../models/comment.model';
export declare class CommentService {
    private readonly commentModel;
    constructor(commentModel: Model<CommentDocument>);
    getCommentsByArticle(articleId: string): Promise<Comment[]>;
    commentExists(id: string | Types.ObjectId): Promise<boolean>;
    createComment(data: Partial<Comment>): Promise<Comment>;
    getAllComments(): Promise<Comment[]>;
    getCommentById(id: string): Promise<Comment>;
    updateComment(id: string, data: Partial<Comment>): Promise<Comment>;
    deleteComment(id: string): Promise<{
        message: string;
    }>;
}
