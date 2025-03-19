import { CommentService } from '../services/comment.service';
import { Comment } from '../models/comment.model';
export declare class CommentController {
    private readonly commentService;
    constructor(commentService: CommentService);
    private populateDummyArticle;
    createComment(data: Partial<Comment>): Promise<Comment>;
    getAllComments(): Promise<Comment[]>;
    getCommentById(id: string): Promise<Comment>;
    updateComment(id: string, data: Partial<Comment>): Promise<Comment>;
    deleteComment(id: string): Promise<{
        message: string;
    }>;
}
