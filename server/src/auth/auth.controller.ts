import {
  Body, // Decorator for request body
  Controller, // Marks class as a NestJS controller
  Post, // HTTP POST decorator
  UseGuards, // Apply route guards
  Get, // HTTP GET decorator
  Request, // Express request object
  HttpCode, // Set HTTP status code
  HttpStatus, // HTTP status codes enum
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../models/user.model';

// Data transfer object for login requests
interface LoginDto {
  identifier: string; // Can be email or username
  password: string;
}

// Response type for successful login
interface LoginResponse {
  user: Partial<User>; // User data without sensitive information
  access_token: string; // JWT token
}

// Data transfer object for registration requests
interface RegisterDto {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Controller handling authentication routes
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /auth/login
  // Handles user login
  @Post('login')
  @HttpCode(HttpStatus.OK) // Set 200 status code instead of 201
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto.identifier, loginDto.password);
  }

  // POST /auth/register
  // Handles new user registration
  @Post('register')
  async register(@Body() userData: RegisterDto) {
    return this.authService.register(userData);
  }

  // GET /auth/profile
  // Returns user profile (requires authentication)
  @UseGuards(JwtAuthGuard) // Protect route with JWT guard
  @Get('profile')
  getProfile(
    @Request() req: { user: { id: string; username: string; email: string } },
  ) {
    return req.user;
  }

  // POST /auth/logout
  // Handles user logout
  @Post('logout')
  @UseGuards(JwtAuthGuard) // Protect route with JWT guard
  @HttpCode(HttpStatus.OK)
  logout() {
    return { message: 'Logged out successfully' };
  }
}
