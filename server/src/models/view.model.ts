import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ViewDocument = View & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class View {
    @Prop()
    _viewer: string;

    @Prop({ type: Types.ObjectId, ref: 'Article', required: true })
    article: Types.ObjectId;

    createdAt?: Date;
    updatedAt?: Date;
}

export const ViewSchema = SchemaFactory.createForClass(View);
