// src/controllers/user.controller.ts

import {
    Controller,
    Get,
    Param,
    UseGuards,
    Request,
    BadRequestException,
    NotFoundException,
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { UserService } from '../services/user.service';
  import { User } from '../models/user.model';
  import { dummyUsers } from '../data/dummyData';
  
  @Controller('api/users')
  export class UserController {
    constructor(private readonly userService: UserService) {}
  
    /**
     * GET /api/users/profile
     * Returns the profile of the authenticated user.
     */
    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    async getProfile(@Request() req: any): Promise<User> {
      const userId = req.user?.userId;
      if (!userId || typeof userId !== 'string') {
        throw new BadRequestException('Invalid user ID in token');
      }
  
      try {
        const userDoc = await this.userService.findById(userId);
        // Omit sensitive fields
        const { passwordHash, ...safe } = userDoc.toObject();
        return safe as User;
      } catch (err) {
        // On 404, fallback to dummy data
        if (err instanceof NotFoundException) {
          const dummy = dummyUsers.find(
            (u) => u._id!.toString() === userId,
          );
          if (dummy) {
            const { passwordHash, ...safeDummy } = dummy as any;
            return safeDummy as User;
          }
        }
        throw err;
      }
    }
  
    /**
     * GET /api/users/:id
     * Lookup a user by ID, with dummy fallback.
     */
    @Get(':id')
    async getById(@Param('id') id: string): Promise<User> {
      try {
        const userDoc = await this.userService.findById(id);
        const { passwordHash, ...safe } = userDoc.toObject();
        return safe as User;
      } catch (err) {
        if (
          err instanceof NotFoundException ||
          err instanceof BadRequestException
        ) {
          const dummy = dummyUsers.find(
            (u) => u._id!.toString() === id,
          );
          if (dummy) {
            const { passwordHash, ...safeDummy } = dummy as any;
            return safeDummy as User;
          }
        }
        throw err;
      }
    }
  
    /**
     * GET /api/users
     * (Optional) Retrieve all users (admin only).
     */
    @Get()
    @UseGuards(AuthGuard('jwt'))
    async getAll(@Request() req: any): Promise<User[]> {
      // You could add role checks here
      const users = await this.userService.getAll();
      return users.map((u) => {
        const { passwordHash, ...safe } = u as any;
        return safe as User;
      });
    }
  }
  