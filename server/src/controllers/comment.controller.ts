import { Controller, Get, Post, Delete, Body, Param, NotFoundException, Put } from '@nestjs/common';
import { CommentService } from '../services/comment.service';
import { Comment } from '../models/comment.model';
import { dummyComments, dummyArticles } from '../data/dummyArticles';

@Controller('api/comments')
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    private populateDummyArticle(comment: Partial<Comment>) {
        const article = dummyArticles.find(
            (article) => article._id?.toString() === comment.article?.toString()
        );

        // Create a new object that will be sent to the view
        return {
            ...comment,
            article: article || comment.article, // Replace ObjectId with full user object
        };
    }

    @Post()
    async createComment(@Body() data: Partial<Comment>) {
        return this.commentService.createComment(data);
    }

    @Get()
    async getAllComments(): Promise<Comment[]> {
        const comments = await this.commentService.getAllComments();
        if (comments.length === 0) {
            return dummyComments.map((comment) => this.populateDummyArticle(comment)) as Comment[];
        }
        console.log(comments);
        return comments;
    }

    @Get(':id')
    async getCommentById(@Param('id') id: string): Promise<Comment> {
        const comment = await this.commentService.getCommentById(id);
        if (!comment) {
            const dummyComment = dummyComments.find((a) => a._id === id);
            if (!dummyComment) {
                throw new NotFoundException('Comment not found');
            }
            return this.populateDummyArticle(dummyComment) as Comment;
        }
        return comment;
    }

    @Put(':id')
    async updateComment(@Param('id') id: string, @Body() data: Partial<Comment>) {
        return this.commentService.updateComment(id, data);
    }

    @Delete(':id')
    async deleteComment(@Param('id') id: string) {
        return this.commentService.deleteComment(id);
    }
}
