import { AuthService } from './auth.service';
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    login(req: any): Promise<{
        access_token: string;
    }>;
}
