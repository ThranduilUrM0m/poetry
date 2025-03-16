import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleController } from '../controllers/article.controller';
import { ArticleService } from '../services/article.service';
import { Article, ArticleSchema } from '../models/article.model';

@Module({
    imports: [MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }])],
    controllers: [ArticleController],
    providers: [ArticleService],
})
export class ArticleModule {}
