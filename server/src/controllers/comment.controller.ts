import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Headers,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { CommentService } from '../services/comment.service';
import { Comment, CommentDocument } from '../models/comment.model';
import { NotificationService } from 'src/services/notification.service';
import { NotificationGateway } from 'src/gateways/notification.gateway';
import { VoteDocument } from 'src/models/vote.model';
import { PopulatedArticle } from './article.controller';

// Type returned after population (if you implement populateComment)
export type PopulatedComment =
    ReturnType<CommentService['populateOne']> extends Promise<infer U> ? U : never;

@Controller('api/comments')
export class CommentController {
    constructor(
        private readonly commentService: CommentService,
        private readonly jwtService: JwtService,
        private readonly notificationService: NotificationService,
        private readonly notificationGateway: NotificationGateway
    ) {}

    @Post()
    async create(@Body() dto: Partial<CommentDocument>): Promise<CommentDocument> {
        const comment = await this.commentService.createComment(dto);

        // Safely get article title if populated
        let articleTitle = '';
        if (comment.article && typeof comment.article === 'object' && 'title' in comment.article) {
            articleTitle = (comment.article as any).title;
        } else {
            articleTitle = comment.article?.toString() || '';
        }

        await this.notificationService.create({
            category: 'comment',
            action: 'created',
            title: 'New Comment',
            message: `New comment by "${comment._comment_author}" on article "${articleTitle}"`,
            metadata: {
                commentId: comment._id,
                author: comment._comment_author,
                email: comment._comment_email,
                article: comment.article,
                body: comment._comment_body,
            },
        });

        this.notificationGateway.server.emit('comment:created', {
            type: 'created',
            comment,
        });

        return comment;
    }

    @Get()
    async findAll(): Promise<PopulatedComment[]> {
        return this.commentService.getAllComments();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<PopulatedComment> {
        return this.commentService.getCommentById(id);
    }

    @Get('article/:id')
    async findByArticle(@Param('id') id: string): Promise<PopulatedComment[]> {
        return this.commentService.getCommentsByArticle(id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: Partial<CommentDocument>
    ): Promise<CommentDocument> {
        // Fetch previous comment for diff
        const prevComment = await this.commentService.getCommentById(id);
        const updated = await this.commentService.updateComment(id, dto);

        // Compare fields
        const changedFields: Record<string, { old: any; new: any }> = {};
        for (const key of Object.keys(dto)) {
            if ((prevComment as any)[key] !== (updated as any)[key]) {
                changedFields[key] = {
                    old: (prevComment as any)[key],
                    new: (updated as any)[key],
                };
            }
        }

        // Only create notification / emit if there are real changes
        const changedKeys = Object.keys(changedFields);
        if (changedKeys.length > 0) {
            const message = `Comment updated: ${changedKeys
                .map((k) => `${k}: "${changedFields[k].old}" → "${changedFields[k].new}"`)
                .join(', ')}`;

            await this.notificationService.create({
                category: 'comment',
                action: 'updated',
                title: 'Comment Updated',
                message,
                metadata: {
                    commentId: updated._id,
                    author: updated._comment_author,
                    article: updated.article,
                    changed: changedFields,
                },
            });

            this.notificationGateway.server.emit('comment:updated', {
                type: 'updated',
                comment: updated,
                changed: changedFields,
            });
        }

        return updated;
    }

    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @Headers('authorization') auth?: string,
        @Headers('x-comment-fingerprint') fp?: string
    ): Promise<{ message: string }> {
        const comment = await this.commentService.getCommentById(id);

        // Admin via JWT
        if (auth) {
            const token = auth.replace(/^Bearer\s/, '');
            try {
                this.jwtService.verify(token);
                await this.commentService.deleteComment(id);

                await this.notificationService.create({
                    category: 'comment',
                    action: 'deleted',
                    title: 'Comment Deleted',
                    message: `Comment by "${comment._comment_author}" deleted (admin)`,
                    metadata: {
                        commentId: comment._id,
                        author: comment._comment_author,
                        article: comment.article,
                    },
                });

                this.notificationGateway.server.emit('comment:deleted', {
                    type: 'deleted',
                    commentId: comment._id,
                });

                return { message: 'Deleted by admin' };
            } catch {
                throw new UnauthorizedException('Invalid token');
            }
        }

        // Owner via fingerprint
        if (fp && (comment as any)._comment_fingerprint === fp) {
            await this.commentService.deleteComment(id);

            await this.notificationService.create({
                category: 'comment',
                action: 'deleted',
                title: 'Comment Deleted',
                message: `Comment by "${comment._comment_author}" deleted (owner)`,
                metadata: {
                    commentId: comment._id,
                    author: comment._comment_author,
                    article: comment.article,
                },
            });

            this.notificationGateway.server.emit('comment:deleted', {
                type: 'deleted',
                commentId: comment._id,
            });

            return { message: 'Deleted by owner' };
        }

        throw new UnauthorizedException('Not allowed to delete this comment');
    }

    @Post(':id/vote')
    async vote(
        @Param('id') id: string,
        @Body() body: { fingerprint: string; direction: 'up' | 'down' }
    ): Promise<PopulatedComment> {
        try {
            const { comment, changed } = await this.commentService.toggleVote(
                id,
                body.fingerprint,
                body.direction
            );
            if (changed) {
                await this.notificationService.create({
                    category: 'comment',
                    action: 'voted',
                    title: 'Comment Voted',
                    message: `Comment by "${comment._comment_author}" received a "${body.direction}" vote.`,
                    metadata: {
                        commentId: comment._id,
                        author: comment._comment_author,
                        article: comment.article,
                        direction: body.direction,
                        fingerprint: body.fingerprint,
                    },
                });

                this.notificationGateway.server.emit('comment:voted', {
                    type: 'voted',
                    commentId: comment._id,
                    direction: body.direction,
                    fingerprint: body.fingerprint,
                });
            }

            return comment;
        } catch (err) {
            throw new HttpException(
                err.message || 'Vote failed',
                err.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
