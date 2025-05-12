// comment.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentController } from '../controllers/comment.controller';
import { CommentService } from '../services/comment.service';
import { Comment, CommentSchema } from '../models/comment.model';
import { VoteModule } from './vote.module';
import { ArticleModule } from './article.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from './notification.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
        forwardRef(() => VoteModule),
        forwardRef(() => ArticleModule),
        forwardRef(() => ArticleModule),
        AuthModule,
		NotificationModule
    ],
    controllers: [CommentController],
    providers: [CommentService],
    exports: [MongooseModule, CommentService],
})
export class CommentModule {}
