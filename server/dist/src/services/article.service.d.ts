import { Model, Types } from 'mongoose';
import { Article, ArticleDocument } from '../models/article.model';
import { UserDocument } from '../models/user.model';
import { CommentDocument } from '../models/comment.model';
import { VoteDocument } from '../models/vote.model';
import { ViewDocument } from '../models/view.model';
export interface PopulatedArticle extends Omit<Article, 'author' | 'comments' | 'votes' | 'views'> {
    _id: Types.ObjectId;
    author: UserDocument;
    comments: CommentDocument[];
    votes: VoteDocument[];
    views: ViewDocument[];
}
export declare class ArticleService {
    private readonly articleModel;
    private readonly userModel;
    private readonly commentModel;
    private readonly voteModel;
    private readonly viewModel;
    constructor(articleModel: Model<ArticleDocument>, userModel: Model<UserDocument>, commentModel: Model<CommentDocument>, voteModel: Model<VoteDocument>, viewModel: Model<ViewDocument>);
    private findWithFallback;
    private findOneWithFallback;
    createArticle(data: Partial<Article>): Promise<PopulatedArticle>;
    getAllArticles(): Promise<PopulatedArticle[]>;
    getById(id: string): Promise<PopulatedArticle>;
    getBySlug(category: string, slug: string): Promise<PopulatedArticle>;
    getByCategory(category: string): Promise<PopulatedArticle[]>;
    bulkUpdate(data: Partial<Article>[]): Promise<PopulatedArticle[]>;
    updateById(id: string, data: Partial<Article>): Promise<PopulatedArticle>;
    updateBySlug(slug: string, data: Partial<Article>): Promise<PopulatedArticle>;
    deleteById(id: string): Promise<void>;
    deleteBySlug(slug: string): Promise<void>;
    private populateField;
    private populateArrayField;
    populateOne(article: Article & {
        author: Types.ObjectId | UserDocument;
    }): Promise<PopulatedArticle>;
    populateMany(articles: Article[]): Promise<PopulatedArticle[]>;
    trackView(id: string, fp: string): Promise<{
        article: PopulatedArticle;
        changed: boolean;
    }>;
    toggleVote(id: string, fp: string, direction: 'up' | 'down'): Promise<{
        article: PopulatedArticle;
        changed: boolean;
    }>;
}
