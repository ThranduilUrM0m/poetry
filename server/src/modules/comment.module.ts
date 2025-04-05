import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentController } from '../controllers/comment.controller';
import { CommentService } from '../services/comment.service';
import { Comment, CommentSchema } from '../models/comment.model';
import { Vote, VoteSchema } from '../models/vote.model';
import { Article, ArticleSchema } from '../models/article.model';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Comment.name, schema: CommentSchema },
            { name: Article.name, schema: ArticleSchema },
            { name: Vote.name, schema: VoteSchema },
        ]),
    ],
    controllers: [CommentController],
    providers: [CommentService],
})
export class CommentModule {}
