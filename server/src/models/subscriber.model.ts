import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubscriberDocument = Subscriber & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class Subscriber {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ default: true })
    isSubscribed: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);
