import { AuthService } from './auth.service';
import { User } from '../models/user.model';
interface LoginDto {
    identifier: string;
    password: string;
}
interface LoginResponse {
    user: Partial<User>;
    access_token: string;
}
interface RegisterDto {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<LoginResponse>;
    register(userData: RegisterDto): Promise<{
        email: string;
        username: string;
        firstName?: string;
        lastName?: string;
        city?: string;
        country?: string;
        phone?: string;
        isVerified: boolean;
        isActive: boolean;
        _id: unknown;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    getProfile(req: {
        user: {
            id: string;
            username: string;
            email: string;
        };
    }): {
        id: string;
        username: string;
        email: string;
    };
    logout(): {
        message: string;
    };
}
export {};
