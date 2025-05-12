// vote.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VoteController } from '../controllers/vote.controller';
import { VoteService } from '../services/vote.service';
import { Vote, VoteSchema } from '../models/vote.model';
import { ArticleModule } from './article.module';
import { CommentModule } from './comment.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vote.name, schema: VoteSchema }]),
    forwardRef(() => ArticleModule),
    forwardRef(() => CommentModule)
  ],
  controllers: [VoteController],
  providers: [VoteService],
  exports: [MongooseModule, VoteService],
})
export class VoteModule {}