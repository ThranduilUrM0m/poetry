import { Model } from 'mongoose';
import { View } from '../models/view.model';
import { Article, ArticleDocument } from '../models/article.model';
import { ViewService } from '../services/view.service';
export type PopulatedView = Omit<View, 'article'> & {
    article: Article;
};
export declare class ViewController {
    private readonly viewService;
    private readonly viewModel;
    private readonly articleModel;
    constructor(viewService: ViewService, viewModel: Model<View>, articleModel: Model<ArticleDocument>);
    private populateField;
    private populateView;
    createView(data: Partial<View>): Promise<PopulatedView>;
    getAllViews(): Promise<PopulatedView[]>;
    getViewById(id: string): Promise<PopulatedView>;
    updateView(id: string, data: Partial<View>): Promise<PopulatedView>;
    deleteView(id: string): Promise<unknown>;
}
