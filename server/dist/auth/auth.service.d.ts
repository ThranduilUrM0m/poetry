import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/user.model';
interface AuthUser extends UserDocument {
    authenticate(password: string): Promise<boolean>;
    getToken(): string;
}
export declare class AuthService {
    private userModel;
    private jwtService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService);
    validateUser(identifier: string, password: string): Promise<Omit<AuthUser, 'password'>>;
    login(identifier: string, password: string): Promise<{
        user: Omit<AuthUser, "password">;
        access_token: string;
    }>;
    register(userData: Partial<User>): Promise<{
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
}
export {};
