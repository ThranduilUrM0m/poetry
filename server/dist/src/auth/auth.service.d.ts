import { JwtService } from '@nestjs/jwt';
import { UserService } from '../services/user.service';
export declare class AuthService {
    private userService;
    private jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    validateUser(login: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
    }>;
}
