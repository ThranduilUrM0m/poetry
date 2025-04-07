import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../services/user.service';
import { UserDocument } from '../models/user.model';
import { dummyUsers } from '../data/dummyData';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    /**
     * Validates a user using the provided login and password.
     * First, looks for the user in the database.
     * If not found, falls back to searching in the dummyUsers file.
     * Throws an UnauthorizedException with custom messages if validation fails.
     */
    async validateUser(login: string, pass: string): Promise<any> {
        // Attempt to find the user in the database (using email or username)
        let user: UserDocument | null = await this.userService.findByLogin(login);

        if (!user) {
            // Fallback: search in dummy data if not found in DB.
            // Adjust the condition based on your dummy user shape.
            const dummyUser = dummyUsers.find(
                (u) =>
                    (u.email && u.email.toLowerCase() === login.toLowerCase()) ||
                    (u.username && u.username.toLowerCase() === login.toLowerCase())
            );
            if (dummyUser) {
                console.log(dummyUser);
                // Verify password using bcrypt.
                if (!dummyUser.passwordHash) {
                    throw new UnauthorizedException('Invalid credentials: password hash is missing.');
                }
                const matches = await bcrypt.compare(pass, dummyUser.passwordHash);
                if (matches) {
                    // Remove sensitive information before returning.
                    const safeUser = { ...dummyUser };
                    delete safeUser.passwordHash;
                    return safeUser;
                } else {
                    // Password mismatch in dummy data.
                    throw new UnauthorizedException(
                        'Invalid credentials: password does not match (fallback).'
                    );
                }
            }
            // No user found in dummy fallback.
            throw new UnauthorizedException('User not found in database or fallback data.');
        }

        // User found in the database: verify the password.
        const matches = await bcrypt.compare(pass, user.passwordHash);
        if (!matches) {
            throw new UnauthorizedException('Invalid credentials: password does not match.');
        }
        // Convert the Mongoose document to a plain object and remove sensitive fields.
        const safeUser = user.toObject();
        delete safeUser.passwordHash;
        return safeUser;
    }

    /**
     * Issues a JWT for the validated user.
     */
    async login(user: any) {
        const payload = { sub: user._id, email: user.email };
        return { access_token: this.jwtService.sign(payload) };
    }
}
