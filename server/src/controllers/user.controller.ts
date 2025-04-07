import {
    Controller,
    Get,
    /* Post,
    Put,
    Delete, */
    Param,
    NotFoundException,
    /* Body, */
    /* HttpException,
    HttpStatus, */
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/user.model';
import { UserService } from '../services/user.service';
import { dummyUsers } from '../data/dummyData';

@Controller('api/users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {}

    @Get(':id')
    async getUserById(@Param('id') id: string): Promise<User> {
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
