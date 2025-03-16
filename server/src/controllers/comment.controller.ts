import { Controller, Get } from '@nestjs/common';
import { CommentService } from '../services/comment.service';
import { Comment } from '../models/comment.model';
import { dummyComments } from '../data/dummyArticles';

@Controller('api/comments')
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    @Get()
    async getComments(): Promise<Comment[]> {
        const comments = await this.commentService.getCommentsWithArticleTitle();
        if (comments.length === 0) {
            return dummyComments as Comment[];
        }
        return comments;
    }
}
