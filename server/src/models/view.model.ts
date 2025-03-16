import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ViewDocument = View & Document;

@Schema({ timestamps: true })
export class View {
    @Prop()
    _viewer: string;

    createdAt?: Date;
    updatedAt?: Date;
}

export const ViewSchema = SchemaFactory.createForClass(View);
