// src/controllers/view.controller.ts

import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ViewService } from '../services/view.service';
import { ArticleService } from '../services/article.service';
import { View } from '../models/view.model';
import { Article } from '../models/article.model';
import { dummyViews, dummyArticles } from '../data/dummyData';

export type PopulatedView = Omit<View, 'article'> & { article: Article };

@Controller('api/views')
export class ViewController {
    constructor(
        private readonly viewService: ViewService,
        private readonly articleService: ArticleService // ← inject it
    ) {}

    @Post()
    async createView(@Body() data: Partial<View>): Promise<PopulatedView> {
        const view = await this.viewService.createView(data);
        return this.populateView(view);
    }

    @Get()
    async getAllViews(): Promise<PopulatedView[]> {
        const views = await this.viewService.getAllViews();
        return Promise.all(views.map((v) => this.populateView(v)));
    }

    @Get(':id')
    async getViewById(@Param('id') id: string): Promise<PopulatedView> {
        let view: View;
        try {
            view = await this.viewService.getViewById(id);
        } catch {
            // fallback to dummy
            const dummy = dummyViews.find((d) => d._id?.toString() === id);
            if (!dummy) {
                throw new NotFoundException('View not found');
            }
            view = dummy as View;
        }
        return this.populateView(view);
    }

    @Patch(':id')
    async updateView(@Param('id') id: string, @Body() data: Partial<View>): Promise<PopulatedView> {
        const updated = await this.viewService.updateView(id, data);
        return this.populateView(updated);
    }

    @Delete(':id')
    async deleteView(@Param('id') id: string): Promise<{ message: string }> {
        return this.viewService.deleteView(id);
    }

    private async populateView(view: View): Promise<PopulatedView> {
        let article: any = null;

        // If the view.article is an ObjectId, try loading from DB
        if (view.article instanceof Types.ObjectId) {
            try {
                article = await this.articleService.getById(view.article.toString());
            } catch {
                article = null;
            }
        } else {
            // It may already be populated
            article = view.article as any;
        }

        // Fallback to dummyArticles, but only if we find a dummy with a _id
        if (!article) {
            const fallback = dummyArticles.find(
                (a) => a._id !== undefined && a._id.toString() === view.article.toString()
            );
            if (fallback && fallback._id) {
                article = fallback as any;
            }
        }

        if (!article) {
            throw new NotFoundException('Associated article not found');
        }

        return { ...view, article };
    }
}
