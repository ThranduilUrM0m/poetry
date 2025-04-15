import {
    Controller,
    Get,
    Param,
    UseGuards,
    NotFoundException,
    BadRequestException,
    Request,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { User, UserDocument } from '../models/user.model';
import { UserService } from '../services/user.service';
import { dummyUsers } from '../data/dummyData';

@Controller('api/users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {}

    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    async getProfile(@Request() req): Promise<User> {
        if (!req.user || !req.user.userId) {
            throw new BadRequestException('Invalid user ID from token');
        }

        try {
            // First try to get from DB
            const userFromDb = await this.userService.findById(req.user.userId);
            return userFromDb;
        } catch (error) {
            // If DB lookup fails, check dummy users
            const dummyUser = dummyUsers.find((a) => a._id?.toString() === req.user.userId);
            if (!dummyUser) {
                throw new NotFoundException('User not found in database or dummy data');
            }
            return dummyUser as User;
        }
    }

    @Get(':id')
    async getUserById(@Param('id') id: string): Promise<User> {
        if (!isValidObjectId(id)) {
            throw new BadRequestException('Invalid user ID format');
        }

        const userFromDb = await this.userService.findById(id);
        if (userFromDb) {
            return userFromDb;
        }

        const dummyUser = dummyUsers.find((a) => a._id?.toString() === id);
        if (!dummyUser) {
            throw new NotFoundException('User not found');
        }

        return dummyUser as User;
    }
}
