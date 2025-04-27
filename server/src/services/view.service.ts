import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { View, ViewDocument } from '../models/view.model';

@Injectable()
export class ViewService {
    constructor(@InjectModel(View.name) private viewModel: Model<ViewDocument>) {}

    async createView(data: Partial<View>): Promise<View> {
        const newView = new this.viewModel(data);
        return newView.save();
    }

    async getAllViews(): Promise<View[]> {
        const views = await this.viewModel.aggregate([
            // Populate article
            {
                $lookup: {
                    from: 'articles', // Collection name for articles
                    localField: 'article',
                    foreignField: '_id',
                    as: 'articleLookup',
                },
            },
            {
                $addFields: {
                    article: {
                        $cond: {
                            if: { $gt: [{ $size: '$articleLookup' }, 0] },
                            then: { $arrayElemAt: ['$articleLookup', 0] },
                            else: '$article', // Keep original ObjectID
                        },
                    },
                },
            },
            { $project: { articleLookup: 0 } },
        ]);

        return views;
    }

    async getViewById(id: string): Promise<View> {
        const [view] = await this.viewModel.aggregate([
            { $match: { _id: new Types.ObjectId(id) } },
            // Same population logic as above
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
                        $cond: {
                            if: { $gt: [{ $size: '$articleLookup' }, 0] },
                            then: { $arrayElemAt: ['$articleLookup', 0] },
                            else: '$article',
                        },
                    },
                },
            },
            { $project: { articleLookup: 0 } },
            { $limit: 1 }, // Simulate findById
        ]);

        if (!view) throw new NotFoundException('View not found');
        return view;
    }

    async deleteView(id: string): Promise<{ message: string }> {
        const view = await this.viewModel.findByIdAndDelete(id);
        if (!view) throw new NotFoundException('View not found');
        return { message: 'View deleted successfully' };
    }

    async updateView(id: string, data: Partial<View>): Promise<View> {
        const view = await this.viewModel.findByIdAndUpdate(id, data, { new: true });
        if (!view) throw new NotFoundException('View not found');
        return view;
    }
}
