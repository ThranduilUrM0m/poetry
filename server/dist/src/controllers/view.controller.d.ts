import { ViewService } from '../services/view.service';
import { ArticleService } from '../services/article.service';
import { View } from '../models/view.model';
import { Article } from '../models/article.model';
export type PopulatedView = Omit<View, 'article'> & {
    article: Article;
};
export declare class ViewController {
    private readonly viewService;
    private readonly articleService;
    constructor(viewService: ViewService, articleService: ArticleService);
    createView(data: Partial<View>): Promise<PopulatedView>;
    getAllViews(): Promise<PopulatedView[]>;
    getViewById(id: string): Promise<PopulatedView>;
    updateView(id: string, data: Partial<View>): Promise<PopulatedView>;
    deleteView(id: string): Promise<{
        message: string;
    }>;
    private populateView;
}
