import { Model } from 'mongoose';
import { View, ViewDocument } from '../models/view.model';
import { ArticleDocument } from '../models/article.model';
export declare class ViewService {
    private readonly viewModel;
    private readonly articleModel;
    constructor(viewModel: Model<ViewDocument>, articleModel: Model<ArticleDocument>);
    private validateId;
    private getArticleLookupPipeline;
    private aggregateViews;
    private getViewByIdOrThrow;
    private findWithFallback;
    private findOneWithFallback;
    private populateView;
    createView(data: Partial<View>): Promise<View>;
    getAllViews(): Promise<View[]>;
    getViewById(id: string): Promise<View>;
    updateView(id: string, data: Partial<View>): Promise<View>;
    deleteView(id: string): Promise<{
        message: string;
    }>;
}
