import { JwtService } from '@nestjs/jwt';
import { CommentService } from '../services/comment.service';
import { CommentDocument } from '../models/comment.model';
import { NotificationService } from 'src/services/notification.service';
import { NotificationGateway } from 'src/gateways/notification.gateway';
export type PopulatedComment = ReturnType<CommentService['populateOne']> extends Promise<infer U> ? U : never;
export declare class CommentController {
    private readonly commentService;
    private readonly jwtService;
    private readonly notificationService;
    private readonly notificationGateway;
    constructor(commentService: CommentService, jwtService: JwtService, notificationService: NotificationService, notificationGateway: NotificationGateway);
    create(dto: Partial<CommentDocument>): Promise<CommentDocument>;
    findAll(): Promise<PopulatedComment[]>;
    findOne(id: string): Promise<PopulatedComment>;
    findByArticle(id: string): Promise<PopulatedComment[]>;
    update(id: string, dto: Partial<CommentDocument>): Promise<CommentDocument>;
    remove(id: string, auth?: string, fp?: string): Promise<{
        message: string;
    }>;
    vote(id: string, body: {
        fingerprint: string;
        direction: 'up' | 'down';
    }): Promise<PopulatedComment>;
}
