import { CommentService } from '../services/comment.service';
import { Comment } from '../models/comment.model';
export declare class CommentController {
    private readonly commentService;
    constructor(commentService: CommentService);
    getComments(): Promise<Comment[]>;
}
