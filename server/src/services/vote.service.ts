// src/services/vote.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, isObjectIdOrHexString } from 'mongoose';
import { Vote, VoteDocument } from '../models/vote.model';
import { dummyVotes } from 'src/data/dummyData';

@Injectable()
export class VoteService {
    constructor(
        @InjectModel(Vote.name)
        private readonly voteModel: Model<VoteDocument>
    ) {}

    // ─── Private Helpers ────────────────────────────────────

    /**
     * Validates that `id` is a valid ObjectId, or throws BadRequestException.
     */
    private validateId(id: string, entity = 'vote ID'): Types.ObjectId {
        if (!isObjectIdOrHexString(id)) {
            throw new BadRequestException(`Invalid ${entity} "${id}"`);
        }
        return new Types.ObjectId(id);
    }

    /**
     * Fetches a single Vote by ID or throws NotFoundException.
     */
    private async getByIdOrThrow(id: string): Promise<Vote> {
        const objectId = this.validateId(id);
        const vote = await this.voteModel.findById(objectId).lean().exec();
        if (!vote) {
            throw new NotFoundException(`Vote "${id}" not found`);
        }
        return vote;
    }

    private async findOneWithFallback(
        filter: FilterQuery<VoteDocument> | string,
        isId = false
    ): Promise<Vote> {
        let doc: VoteDocument | null = null;

        if (isId) {
            if (!isObjectIdOrHexString(filter as string)) {
                throw new BadRequestException(`Invalid Vote ID "${filter}"`);
            }
            doc = await this.voteModel.findById(filter as string).lean().exec();
        } else {
            doc = await this.voteModel.findOne(filter as FilterQuery<VoteDocument>).lean().exec();
        }

        if (doc) return doc;

        let fallback = dummyVotes.find(v => {
            if (isId) {
                return v._id && v._id.toString() === filter;
            }
            return Object.entries(filter as object).every(([k, val]) => 
                String((v as any)[k] ?? '').toLowerCase() === String(val).toLowerCase()
            );
        });

        if (fallback) {
            if (fallback._id && fallback.voter && fallback.target) {
                return {
                    ...fallback,
                    _id: fallback._id,
                    createdAt: fallback.createdAt || new Date(),
                    updatedAt: fallback.updatedAt || new Date()
                } as Vote;
            }
        }

        const criteria = isId ? `ID "${filter}"` : JSON.stringify(filter);
        throw new NotFoundException(`No vote found for ${criteria}`);
    }

    // ─── Public API ─────────────────────────────────────────

    /**
     * Create a new vote.
     * @throws BadRequestException if required fields missing.
     */
    async createVote(data: Partial<Vote>): Promise<Vote> {
        if (!data.target || !data.targetType) {
            throw new BadRequestException('`target` and `targetType` are required');
        }
        const vote = new this.voteModel(data);
        return (await vote.save()).toObject();
    }

    /**
     * Get all votes.
     */
    async getAllVotes(): Promise<Vote[]> {
        return this.voteModel.find().lean().exec();
    }

    /**
     * Get a single vote by ID.
     * @throws BadRequestException if ID invalid.
     * @throws NotFoundException if not found.
     */
    async getVoteById(id: string): Promise<Vote> {
        return this.getByIdOrThrow(id);
    }

    /**
     * Update a vote by ID.
     * @throws BadRequestException if ID invalid.
     * @throws NotFoundException if not found.
     */
    async updateVote(id: string, data: Partial<Vote>): Promise<Vote> {
        this.validateId(id);
        const updated = await this.voteModel
            .findByIdAndUpdate(id, data, {
                new: true,
                runValidators: true,
                lean: true,
            })
            .exec();

        if (!updated) {
            throw new NotFoundException(`Vote "${id}" not found`);
        }
        return updated;
    }

    /**
     * Delete a vote by ID.
     * @throws BadRequestException if ID invalid.
     * @throws NotFoundException if not found.
     */
    async deleteVote(id: string): Promise<{ message: string }> {
        this.validateId(id);
        const deleted = await this.voteModel.findByIdAndDelete(id).exec();
        if (!deleted) {
            throw new NotFoundException(`Vote "${id}" not found`);
        }
        return { message: 'Vote deleted successfully' };
    }
}
