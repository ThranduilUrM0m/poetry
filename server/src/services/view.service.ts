import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { View, ViewDocument } from '../models/view.model';

@Injectable()
export class ViewService {
    constructor(@InjectModel(View.name) private viewModel: Model<ViewDocument>) {}

    async createView(data: Partial<View>): Promise<View> {
        const newView = new this.viewModel(data);
        return newView.save();
    }

    async getAllViews(): Promise<View[]> {
        const views = await this.viewModel.find().populate('article');
        return views;
    }

    async getViewById(id: string): Promise<View> {
        const view = await this.viewModel.findById(id).populate('article');
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
