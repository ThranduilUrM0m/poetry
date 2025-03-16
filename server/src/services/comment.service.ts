import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../models/comment.model';

@Injectable()
export class CommentService {
    constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

    async getCommentsWithArticleTitle(): Promise<Comment[]> {
        return this.commentModel.find().populate('_article', 'title').exec();
    }
}
