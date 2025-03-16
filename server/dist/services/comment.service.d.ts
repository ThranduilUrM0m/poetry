import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../models/comment.model';
export declare class CommentService {
    private commentModel;
    constructor(commentModel: Model<CommentDocument>);
    createComment(data: Partial<Comment>): Promise<Comment>;
    getAllComments(): Promise<Comment[]>;
    getCommentById(id: string): Promise<Comment>;
    deleteComment(id: string): Promise<{
        message: string;
    }>;
    updateComment(id: string, data: Partial<Comment>): Promise<Comment>;
}
