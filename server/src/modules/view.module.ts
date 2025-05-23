// view.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ViewController } from '../controllers/view.controller';
import { ViewService } from '../services/view.service';
import { View, ViewSchema } from '../models/view.model';
import { Article, ArticleSchema } from '../models/article.model';
import { ArticleModule } from './article.module';
import { NotificationService } from '../services/notification.service';
import { NotificationModule } from './notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: View.name, schema: ViewSchema },
      { name: Article.name, schema: ArticleSchema }
    ]),
    forwardRef(() => ArticleModule),
    NotificationModule,
  ],
  controllers: [ViewController],
  providers: [ViewService, NotificationService],
  exports: [MongooseModule, ViewService],
})
export class ViewModule {}