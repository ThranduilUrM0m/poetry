import { Model } from 'mongoose';
import { User, UserDocument } from '../models/user.model';
import { UserService } from '../services/user.service';
export declare class UserController {
    private readonly userService;
    private readonly userModel;
    constructor(userService: UserService, userModel: Model<UserDocument>);
    getUserById(id: string): Promise<User>;
}
