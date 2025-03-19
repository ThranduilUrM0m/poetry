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
    register(userData: RegisterDto): Promise<Omit<User, "password">>;
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
