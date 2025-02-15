import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(userData: any): Promise<import("mongoose").Document<unknown, {}, import("../models/user.model").UserDocument> & import("../models/user.model").User & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    login(userData: any): Promise<{
        access_token: string;
    }>;
    getProfile(req: any): any;
}
