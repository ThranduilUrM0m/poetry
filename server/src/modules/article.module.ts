import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleController } from '../controllers/article.controller';
import { ArticleService } from '../services/article.service';
import { Article, ArticleSchema } from '../models/article.model';
import { UserModule } from './user.module';
import { CommentModule } from './comment.module';
import { VoteModule } from './vote.module';
import { ViewModule } from './view.module';
import { NotificationModule } from './notification.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
        UserModule,
        forwardRef(() => CommentModule),
        forwardRef(() => VoteModule),
        forwardRef(() => ViewModule),
		NotificationModule
    ],
    controllers: [ArticleController],
    providers: [ArticleService],
    exports: [ArticleService],
})
export class ArticleModule {}
