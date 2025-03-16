import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DownvoteDocument = Downvote & Document;

@Schema({ timestamps: true })
export class Downvote {
    @Prop()
    _downvoter: string;

    createdAt?: Date;
    updatedAt?: Date;
}

export const DownvoteSchema = SchemaFactory.createForClass(Downvote);
