import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticleModule } from './modules/article.module';
import { SubscriberModule } from './modules/subscriber.module';
import { ContactModule } from './modules/contact.module';
import { CommentModule } from './modules/comment.module';
import { ViewModule } from './modules/view.module';
import { VoteModule } from './modules/vote.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_URI'),
            }),
            inject: [ConfigService],
        }),
        ArticleModule,
        CommentModule,
        ViewModule,
        VoteModule,
        SubscriberModule,
        ContactModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
