// src/services/user.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isObjectIdOrHexString } from 'mongoose';
import { User, UserDocument } from '../models/user.model';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>
    ) {}

    // ─── Private Helpers ────────────────────────────────────

    /**
     * Ensures the given string is a valid ObjectId and fetches the user.
     * @throws BadRequestException if format is invalid.
     * @throws NotFoundException if no user is found.
     */
    private async getByIdOrThrow(id: string): Promise<UserDocument> {
        if (!isObjectIdOrHexString(id)) {
            throw new BadRequestException(`Invalid user ID format: "${id}"`);
        }

        const user = await this.userModel.findById(id).exec();

        if (!user) {
            throw new NotFoundException(`User with ID "${id}" not found`);
        }

        return user;
    }

    // ─── Public API ─────────────────────────────────────────

    /**
     * Find a user by MongoDB ObjectId.
     * @throws BadRequestException if `id` is not valid.
     * @throws NotFoundException if no user is found.
     */
    async findById(id: string): Promise<UserDocument> {
        return this.getByIdOrThrow(id);
    }

    /**
     * Find a user by email or username.
     * Returns null if none found.
     */
    async findByLogin(login: string): Promise<UserDocument | null> {
        return this.userModel
            .findOne({
                $or: [{ email: login }, { username: login }],
            })
            .exec();
    }

    /**
     * Find a user by email.
     * Returns null if none found.
     */
    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    /**
     * Retrieve all users (for admin use).
     */
    async getAll(): Promise<UserDocument[]> {
        return this.userModel.find().lean().exec();
    }
}
