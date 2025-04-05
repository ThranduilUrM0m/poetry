import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from '../models/comment.model';

@Injectable()
export class CommentService {
    constructor(@InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>) {}

    /**
     * Retrieves comments from the database by article ID.
     * @param articleId - The article's ID as a string.
     * @returns A Promise of an array of Comment documents.
     */
    async getCommentsByArticle(articleId: string): Promise<Comment[]> {
        try {
            const articleObjectId = new Types.ObjectId(articleId);
            // First get comments without population
            const comments = await this.commentModel
                .find({ article: articleObjectId })
                .sort({ createdAt: -1 })
                .lean()
                .exec();

            return comments;
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    }

    /**
     * Checks if a comment exists by its ID.
     * @param id - The ID of the comment to check.
     * @returns A boolean indicating the existence of the comment.
     */
    async commentExists(id: string | Types.ObjectId): Promise<boolean> {
        const idToCheck = typeof id === 'string' ? id : id.toString();

        if (!Types.ObjectId.isValid(idToCheck)) return false;

        const exists = await this.commentModel.exists({
            _id: new Types.ObjectId(idToCheck),
        });

        return !!exists;
    }

    /**
     * Creates a new comment.
     * @param data - Partial comment data.
     * @returns The created comment.
     */
    async createComment(data: Partial<Comment>): Promise<Comment> {
        if (data.Parent) {
            const parentId = data.Parent.toString();
            const parentExists = await this.commentExists(parentId);

            if (!parentExists) {
                throw new NotFoundException('Parent comment not found');
            }
        }

        const newComment = new this.commentModel({
            ...data,
            isFeatured: data.isFeatured || false,
        });
        return newComment.save();
    }

    /**
     * Retrieves all comments.
     * @returns An array of comments.
     */
    async getAllComments(): Promise<Comment[]> {
        try {
            // First get comments without population
            const comments = await this.commentModel.find().sort({ createdAt: -1 }).lean().exec();

            if (!comments || comments.length === 0) {
                console.warn('No comments found in database');
                return [];
            }

            return comments;
        } catch (error: unknown) {
            console.error('Error in getAllComments service:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to fetch comments: ${errorMessage}`);
        }
    }

    /**
     * Retrieves a comment by its ID.
     * @param id - The ID of the comment to retrieve.
     * @returns The found comment.
     * @throws NotFoundException if the comment is not found.
     */
    async getCommentById(id: string): Promise<Comment> {
        const comment = await this.commentModel.findById(id).populate('article').exec();
        if (!comment) throw new NotFoundException('Comment not found');
        return comment;
    }

    /**
     * Updates a comment by its ID.
     * @param id - The ID of the comment to update.
     * @param data - Partial comment data for update.
     * @returns The updated comment.
     * @throws NotFoundException if the comment is not found.
     * @throws BadRequestException if there's an attempt to change the parent ID.
     */
    async updateComment(id: string, data: Partial<Comment>): Promise<Comment> {
        if (data.Parent) {
            throw new BadRequestException('Cannot change comment parent');
        }

        const comment = await this.commentModel
            .findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
            })
            .exec();
        if (!comment) throw new NotFoundException('Comment not found');
        return comment;
    }

    /**
     * Deletes a comment by its ID.
     * @param id - The ID of the comment to delete.
     * @returns A message confirming deletion.
     * @throws NotFoundException if the comment is not found.
     */
    async deleteComment(id: string): Promise<{ message: string }> {
        const comment = await this.commentModel.findByIdAndDelete(id).exec();
        if (!comment) throw new NotFoundException('Comment not found');
        return { message: 'Comment deleted successfully' };
    }
}
