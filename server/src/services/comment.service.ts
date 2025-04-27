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
            const comments = await this.commentModel.aggregate([
                { $match: { article: articleObjectId } },
                // Populate article
                {
                    $lookup: {
                        from: 'articles',
                        localField: 'article',
                        foreignField: '_id',
                        as: 'articleLookup',
                    },
                },
                {
                    $addFields: {
                        article: {
                            $cond: [
                                { $gt: [{ $size: '$articleLookup' }, 0] },
                                { $arrayElemAt: ['$articleLookup', 0] },
                                '$article', // Keep original ID if not found
                            ],
                        },
                    },
                },
                { $project: { articleLookup: 0 } },
                // Populate Parent
                {
                    $lookup: {
                        from: 'comments',
                        localField: 'Parent',
                        foreignField: '_id',
                        as: 'parentLookup',
                    },
                },
                {
                    $addFields: {
                        Parent: {
                            $cond: [
                                { $gt: [{ $size: '$parentLookup' }, 0] },
                                { $arrayElemAt: ['$parentLookup', 0] },
                                '$Parent', // Keep original ID
                            ],
                        },
                    },
                },
                { $project: { parentLookup: 0 } },
                { $sort: { createdAt: -1 } },
            ]);

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
            isFeatured: data.isFeatured || true,
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
            const comments = await this.commentModel.aggregate([
                // Handle 'article' population
                {
                    $lookup: {
                        from: 'articles', // The collection name for articles
                        localField: 'article', // The field in comments
                        foreignField: '_id', // The field in articles
                        as: 'articleLookup', // Temporary array to hold lookup results
                    },
                },
                {
                    $addFields: {
                        article: {
                            $cond: {
                                // Check if the lookup found any results
                                if: { $gt: [{ $size: '$articleLookup' }, 0] },
                                // If found, use the first (and only) document
                                then: { $arrayElemAt: ['$articleLookup', 0] },
                                // If not found, retain the original ObjectId
                                else: '$article',
                            },
                        },
                    },
                },
                { $project: { articleLookup: 0 } }, // Remove the temporary field

                // Handle 'Parent' population (assuming it's a self-reference)
                {
                    $lookup: {
                        from: 'comments', // Collection name for parent comments
                        localField: 'Parent',
                        foreignField: '_id',
                        as: 'parentLookup',
                    },
                },
                {
                    $addFields: {
                        Parent: {
                            $cond: {
                                if: { $gt: [{ $size: '$parentLookup' }, 0] },
                                then: { $arrayElemAt: ['$parentLookup', 0] },
                                else: '$Parent',
                            },
                        },
                    },
                },
                { $project: { parentLookup: 0 } }, // Remove the temporary field

                { $sort: { createdAt: -1 } }, // Sort by createdAt descending
            ]);

            // Filter out comments where article population failed (resulted in null)
            const validComments = comments.filter((comment) => comment.article);

            if (validComments.length === 0) {
                console.warn('No valid comments found in database');
                return [];
            }

            return validComments;
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
        const [comment] = await this.commentModel.aggregate([
            { $match: { _id: new Types.ObjectId(id) } },
            // Same lookup/addFields logic as above
            {
                $lookup: {
                    from: 'articles',
                    localField: 'article',
                    foreignField: '_id',
                    as: 'articleLookup',
                },
            },
            {
                $addFields: {
                    article: {
                        $cond: [
                            { $gt: [{ $size: '$articleLookup' }, 0] },
                            { $arrayElemAt: ['$articleLookup', 0] },
                            '$article',
                        ],
                    },
                },
            },
            { $project: { articleLookup: 0 } },
            {
                $lookup: {
                    from: 'comments',
                    localField: 'Parent',
                    foreignField: '_id',
                    as: 'parentLookup',
                },
            },
            {
                $addFields: {
                    Parent: {
                        $cond: [
                            { $gt: [{ $size: '$parentLookup' }, 0] },
                            { $arrayElemAt: ['$parentLookup', 0] },
                            '$Parent',
                        ],
                    },
                },
            },
            { $project: { parentLookup: 0 } },
        ]);

        // Handle case where no document is found
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

        const updatedComment = await this.commentModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });

        // Then populate using aggregation
        const [comment] = await this.commentModel.aggregate([
            { $match: { _id: updatedComment?._id } },
            {
                $lookup: {
                    from: 'articles',
                    localField: 'article',
                    foreignField: '_id',
                    as: 'articleLookup',
                },
            },
            {
                $addFields: {
                    article: {
                        $cond: [
                            { $gt: [{ $size: '$articleLookup' }, 0] },
                            { $arrayElemAt: ['$articleLookup', 0] },
                            '$article',
                        ],
                    },
                },
            },
            { $project: { articleLookup: 0 } },
            {
                $lookup: {
                    from: 'comments',
                    localField: 'Parent',
                    foreignField: '_id',
                    as: 'parentLookup',
                },
            },
            {
                $addFields: {
                    Parent: {
                        $cond: [
                            { $gt: [{ $size: '$parentLookup' }, 0] },
                            { $arrayElemAt: ['$parentLookup', 0] },
                            '$Parent',
                        ],
                    },
                },
            },
            { $project: { parentLookup: 0 } },
        ]);

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
        // First get the document with populated fields
        const [commentToDelete] = await this.commentModel.aggregate([
            { $match: { _id: new Types.ObjectId(id) } },
            {
                $lookup: {
                    from: 'articles',
                    localField: 'article',
                    foreignField: '_id',
                    as: 'articleLookup',
                },
            },
            {
                $addFields: {
                    article: {
                        $cond: [
                            { $gt: [{ $size: '$articleLookup' }, 0] },
                            { $arrayElemAt: ['$articleLookup', 0] },
                            '$article',
                        ],
                    },
                },
            },
            { $project: { articleLookup: 0 } },
            {
                $lookup: {
                    from: 'comments',
                    localField: 'Parent',
                    foreignField: '_id',
                    as: 'parentLookup',
                },
            },
            {
                $addFields: {
                    Parent: {
                        $cond: [
                            { $gt: [{ $size: '$parentLookup' }, 0] },
                            { $arrayElemAt: ['$parentLookup', 0] },
                            '$Parent',
                        ],
                    },
                },
            },
            { $project: { parentLookup: 0 } },
        ]);

        // Then delete it
        await this.commentModel.findByIdAndDelete(id);

        if (!commentToDelete) throw new NotFoundException('Comment not found');
        return { message: 'Comment deleted successfully' };
    }
}
