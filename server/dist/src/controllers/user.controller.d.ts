import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(req: any): Promise<User>;
    getById(id: string): Promise<User>;
    getAll(req: any): Promise<User[]>;
}
