import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VoteDocument = Vote & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class Vote {
    @Prop({ required: true })
    voter: string; // This replaces _upvoter/_downvoter

    @Prop({ required: true, enum: ['Article', 'Comment'] })
    targetType: string;

    @Prop({ type: Types.ObjectId, required: true })
    target: Types.ObjectId; // This will be either an Article ID or a Comment ID

    @Prop({ required: true, enum: ['up', 'down'] })
    direction: string;

    createdAt?: Date;
    updatedAt?: Date;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);
