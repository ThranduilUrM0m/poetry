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
    register(userData: Partial<User>): Promise<Omit<User, 'password'>>;
}
export {};
