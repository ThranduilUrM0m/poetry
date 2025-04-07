import { Model } from 'mongoose';
import { UserDocument } from '../models/user.model';
export declare class UserService {
    private readonly userModel;
    constructor(userModel: Model<UserDocument>);
    findByLogin(login: string): Promise<UserDocument | null>;
    findByEmail(email: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument>;
}
