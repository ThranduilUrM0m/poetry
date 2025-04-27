import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { CommentController } from '../controllers/comment.controller';
import { CommentService } from '../services/comment.service';
import { Comment, CommentSchema } from '../models/comment.model';
import { Article, ArticleSchema } from '../models/article.model';
import { Vote, VoteSchema } from '../models/vote.model';
import { jwtConstants } from '../auth/constants';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Comment.name, schema: CommentSchema },
            { name: Article.name, schema: ArticleSchema },
            { name: Vote.name, schema: VoteSchema },
        ]),
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: jwtConstants.expiresIn },
        }),
    ],
    controllers: [CommentController],
    providers: [CommentService],
    exports: [CommentService],
})
export class CommentModule {}
