import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ViewController } from '../controllers/view.controller';
import { ViewService } from '../services/view.service';
import { View, ViewSchema } from '../models/view.model';
import { Article, ArticleSchema } from '../models/article.model';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: View.name, schema: ViewSchema },
            { name: Article.name, schema: ArticleSchema },
        ]),
    ],
    controllers: [ViewController],
    providers: [ViewService],
})
export class ViewModule {}
