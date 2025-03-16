import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UpvoteDocument = Upvote & Document;

@Schema({ timestamps: true })
export class Upvote {
    @Prop()
    _upvoter: string;

    createdAt?: Date;
    updatedAt?: Date;
}

export const UpvoteSchema = SchemaFactory.createForClass(Upvote);
