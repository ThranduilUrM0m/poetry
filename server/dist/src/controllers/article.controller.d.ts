import { Model } from 'mongoose';
import { Article } from '../models/article.model';
import { UserDocument } from '../models/user.model';
import { CommentDocument } from '../models/comment.model';
import { ViewDocument } from '../models/view.model';
import { VoteDocument } from '../models/vote.model';
import { ArticleService } from '../services/article.service';
export type PopulatedArticle = Omit<Article, 'author' | 'comments' | 'votes' | 'views'> & {
    author: UserDocument;
    comments: CommentDocument[];
    votes: VoteDocument[];
    views: ViewDocument[];
};
export declare class ArticleController {
    private readonly articleService;
    private readonly articleModel;
    private readonly userModel;
    private readonly commentModel;
    private readonly viewModel;
    private readonly voteModel;
    constructor(articleService: ArticleService, articleModel: Model<Article>, userModel: Model<UserDocument>, commentModel: Model<CommentDocument>, viewModel: Model<ViewDocument>, voteModel: Model<VoteDocument>);
    private populateField;
    private populateArrayField;
    private populateArticle;
    createArticle(data: Partial<Article>): Promise<Article>;
    getAllArticles(): Promise<PopulatedArticle[]>;
    getArticlesByCategory(category: string): Promise<PopulatedArticle[]>;
    getArticleBySlug(category: string, slug: string): Promise<PopulatedArticle>;
    updateArticle(slug: string, data: Partial<Article>): Promise<PopulatedArticle>;
    updateArticles(data: Partial<Article>[]): Promise<PopulatedArticle[]>;
    deleteArticle(slug: string): Promise<{
        message: string;
    }>;
    trackView(id: string, body: {
        fingerprint: string;
    }): Promise<PopulatedArticle>;
    vote(id: string, body: {
        fingerprint: string;
        direction: 'up' | 'down';
    }): Promise<PopulatedArticle>;
    private toggleVote;
}
