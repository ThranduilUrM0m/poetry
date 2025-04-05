import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleController } from '../controllers/article.controller';
import { ArticleService } from '../services/article.service';

import { Article, ArticleSchema } from '../models/article.model';
import { User, UserSchema } from '../models/user.model';
import { Comment, CommentSchema } from '../models/comment.model';
import { View, ViewSchema } from '../models/view.model';
import { Vote, VoteSchema } from '../models/vote.model';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Article.name, schema: ArticleSchema },
            { name: User.name, schema: UserSchema },
            { name: Comment.name, schema: CommentSchema },
            { name: View.name, schema: ViewSchema },
            { name: Vote.name, schema: VoteSchema },
        ]),
    ],
    controllers: [ArticleController],
    providers: [ArticleService],
})
export class ArticleModule {}
