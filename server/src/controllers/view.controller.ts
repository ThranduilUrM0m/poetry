import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { View } from '../models/view.model';
import { Article, ArticleDocument } from '../models/article.model';
import { ViewService } from '../services/view.service';
import { dummyViews, dummyArticles } from '../data/dummyData';

// Define a type representing a View with its article field populated.
export type PopulatedView = Omit<View, 'article'> & { article: Article };

@Controller('api/views')
export class ViewController {
    constructor(
        private readonly viewService: ViewService,
        @InjectModel(View.name) private readonly viewModel: Model<View>,
        @InjectModel(Article.name) private readonly articleModel: Model<ArticleDocument>
    ) {}

    /**
     * Helper: Populates a single field by querying the database first,
     * and falling back to dummy data if no record is found.
     * The generic type T is constrained to objects having an _id.
     */
    private async populateField<T extends { _id: Types.ObjectId | string }>(
        id: Types.ObjectId,
        model: Model<T>,
        dummyData: T[]
    ): Promise<T> {
        const doc = await model.findById(id).lean().exec();
        if (doc) {
            return doc as T;
        }
        const fallback = dummyData.find((item) => item._id.toString() === id.toString());
        if (fallback) {
            return fallback;
        }
        throw new NotFoundException(`Unable to populate field for id ${id.toString()}`);
    }

    /**
     * Helper: Returns a fully populated view.
     * It populates the 'article' field with the complete Article document.
     */
    private async populateView(view: View): Promise<PopulatedView> {
        const populatedView: PopulatedView = {
            ...view,
            article: {} as Article,
        };

        if (view.article && view.article instanceof Types.ObjectId) {
            populatedView.article = await this.populateField<ArticleDocument>(
                view.article,
                this.articleModel,
                dummyArticles as ArticleDocument[]
            );
        } else {
            populatedView.article = view.article as Article;
        }
        return populatedView;
    }

    @Post()
    async createView(@Body() data: Partial<View>): Promise<PopulatedView> {
        const newView = await this.viewService.createView(data);
        return this.populateView(newView);
    }

    @Get()
    async getAllViews(): Promise<PopulatedView[]> {
        const viewsFromDb = await this.viewService.getAllViews();
        if (viewsFromDb.length > 0) {
            return Promise.all(viewsFromDb.map((view) => this.populateView(view)));
        }
        return Promise.all(dummyViews.map(async (view) => this.populateView(view as View)));
    }

    @Get(':id')
    async getViewById(@Param('id') id: string): Promise<PopulatedView> {
        const viewFromDb = await this.viewService.getViewById(id);
        if (viewFromDb) {
            return this.populateView(viewFromDb);
        }
        const dummyView = dummyViews.find((a) => a._id?.toString() === id);
        if (!dummyView) {
            throw new NotFoundException('View not found');
        }
        return this.populateView(dummyView as View);
    }

    @Put(':id')
    async updateView(@Param('id') id: string, @Body() data: Partial<View>): Promise<PopulatedView> {
        const updatedView = await this.viewService.updateView(id, data);
        return this.populateView(updatedView);
    }

    @Delete(':id')
    async deleteView(@Param('id') id: string): Promise<unknown> {
        return this.viewService.deleteView(id);
    }
}
