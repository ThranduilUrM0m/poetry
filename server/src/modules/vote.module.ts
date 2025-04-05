import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VoteController } from '../controllers/vote.controller';
import { VoteService } from '../services/vote.service';
import { Vote, VoteSchema } from '../models/vote.model';
import { Article, ArticleSchema } from '../models/article.model';
import { Comment, CommentSchema } from '../models/comment.model';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Vote.name, schema: VoteSchema },
            { name: Article.name, schema: ArticleSchema },
            { name: Comment.name, schema: CommentSchema },
        ]),
    ],
    controllers: [VoteController],
    providers: [VoteService],
})
export class VoteModule {}
