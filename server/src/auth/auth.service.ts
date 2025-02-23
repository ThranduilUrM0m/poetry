/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable, // Marks class as a NestJS service
  UnauthorizedException, // Error for authentication failures
  BadRequestException, // Error for invalid requests
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // JWT token service
import { InjectModel } from '@nestjs/mongoose'; // MongoDB model injection
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/user.model';

// Extended interface for authenticated user document
// Adds authentication-specific methods to UserDocument
interface AuthUser extends UserDocument {
  authenticate(password: string): Promise<boolean>;
  getToken(): string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>, // Inject User model
    private jwtService: JwtService, // Inject JWT service
  ) {}

  // Validate user credentials
  async validateUser(
    identifier: string, // Email or username
    password: string,
  ): Promise<Omit<AuthUser, 'password'>> {
    // Find user by email or username
    const user = await this.userModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify password using authenticate method from user model
    const isValid = await (user as unknown as AuthUser).authenticate(password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Remove password from user object before returning
    const { password: _, ...result } = user.toObject();
    return result as unknown as Omit<AuthUser, 'password'>;
  }

  // Handle user login
  async login(identifier: string, password: string) {
    const userDoc = await this.validateUser(identifier, password);
    // Generate JWT token with user information
    const token = this.jwtService.sign({
      sub: (userDoc as AuthUser)._id,
      email: userDoc.email,
      username: userDoc.username,
    });

    return {
      user: userDoc,
      access_token: token,
    };
  }

  // Handle user registration
  async register(userData: Partial<User>) {
    const { email, username, password } = userData;

    // Validate required fields
    if (!email || !username || !password) {
      throw new BadRequestException('Missing required fields');
    }

    // Check for existing users with same email or username
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new BadRequestException('Email or username already exists');
    }

    // Create and save new user
    const newUser = new this.userModel(userData);
    await newUser.save();

    // Remove password from response
    const { password: _, ...result } = newUser.toObject();
    return result;
  }
}
