import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../services/user.service';
import { UserDocument } from '../models/user.model';
import { dummyUsers } from '../data/dummyData';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    /**
     * Validates a user using login (email or username) and password.
     * Falls back to dummyUsers if not found in DB.
     */
    async validateUser(login: string, pass: string): Promise<any> {
        // Try DB first
        let user: UserDocument | null = await this.userService.findByLogin(login);

        if (!user) {
            // Fallback to dummy data
            const dummyUser = dummyUsers.find(
                (u) =>
                    (u.email && u.email.toLowerCase() === login.toLowerCase()) ||
                    (u.username && u.username.toLowerCase() === login.toLowerCase())
            );
            if (!dummyUser) {
                throw new UnauthorizedException('User not found in database or fallback data.');
            }

            if (!dummyUser.passwordHash) {
                throw new UnauthorizedException('Invalid credentials: password hash is missing.');
            }
            const matches = await bcrypt.compare(pass, dummyUser.passwordHash);
            if (!matches) {
                throw new UnauthorizedException(
                    'Invalid credentials: password does not match (fallback).'
                );
            }

            const safeDummy = { ...dummyUser };
            delete safeDummy.passwordHash;
            return safeDummy;
        }

        // Validate DB user
        const matches = await bcrypt.compare(pass, user.passwordHash);
        if (!matches) {
            throw new UnauthorizedException('Invalid credentials: password does not match.');
        }

        const safeUser = user.toObject();
        delete safeUser.passwordHash;
        return safeUser;
    }

    /**
     * Validates a user by their MongoDB `_id`.
     * Throws if the ID is invalid or user not found.
     */
    async validateUserById(id: string): Promise<any> {
        // 1) Check ID format
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid user ID');
        }

        // 2) Try DB lookup
        let user: UserDocument | null = await this.userService.findById(id);

        if (!user) {
            // 3) Fallback to dummy data
            const dummyUser = dummyUsers.find((u) => u._id!.toString() === id);
            if (!dummyUser) {
                throw new NotFoundException('User not found by ID');
            }
            const safeDummy = { ...dummyUser };
            delete safeDummy.passwordHash;
            return safeDummy;
        }

        // 4) Strip sensitive info
        const safeUser = user.toObject();
        delete safeUser.passwordHash;
        return safeUser;
    }

    /** Issues a JWT for the validated user. */
    async login(user: any) {
        const payload = { sub: user._id, email: user.email };
        return { access_token: this.jwtService.sign(payload) };
    }
}
