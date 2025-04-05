import { Model } from 'mongoose';
import { View, ViewDocument } from '../models/view.model';
export declare class ViewService {
    private viewModel;
    constructor(viewModel: Model<ViewDocument>);
    createView(data: Partial<View>): Promise<View>;
    getAllViews(): Promise<View[]>;
    getViewById(id: string): Promise<View>;
    deleteView(id: string): Promise<{
        message: string;
    }>;
    updateView(id: string, data: Partial<View>): Promise<View>;
}
