import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { User, UserDocument } from '../models/user.model';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

    // Finds a user by either email or username.
    async findByLogin(login: string): Promise<UserDocument | null> {
        return this.userModel
            .findOne({
                $or: [{ email: login }, { username: login }],
            })
            .exec();
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findById(id: string): Promise<UserDocument> {
        try {
            if (!isValidObjectId(id)) {
                throw new BadRequestException('Invalid user ID format');
            }

            const user = await this.userModel.findById(id).exec();
            if (!user) {
                throw new NotFoundException('User not found in database');
            }
            return user;
        } catch (error) {
            // Re-throw the error to be handled by the controller
            throw error;
        }
    }
}
