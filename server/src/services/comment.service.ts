import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../models/comment.model';

@Injectable()
export class CommentService {
    constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

    async createComment(data: Partial<Comment>): Promise<Comment> {
        const newComment = new this.commentModel(data);
        return newComment.save();
    }

    async getAllComments(): Promise<Comment[]> {
        const comments = await this.commentModel.find().populate('article');
        return comments;
    }

    async getCommentById(id: string): Promise<Comment> {
        const comment = await this.commentModel.findById(id).populate('article');
        if (!comment) throw new NotFoundException('Comment not found');
        return comment;
    }

    async deleteComment(id: string): Promise<{ message: string }> {
        const comment = await this.commentModel.findByIdAndDelete(id);
        if (!comment) throw new NotFoundException('Comment not found');
        return { message: 'Comment deleted successfully' };
    }

    async updateComment(id: string, data: Partial<Comment>): Promise<Comment> {
        const comment = await this.commentModel.findByIdAndUpdate(id, data, { new: true });
        if (!comment) throw new NotFoundException('Comment not found');
        return comment;
    }
}
