import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as passwordHash from 'password-hash';

export type UserDocument = User & Document & { _id: Types.ObjectId };

interface Country {
    _code: string;
    _country: string;
}

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    firstName?: string;

    @Prop()
    lastName?: string;

    @Prop()
    city?: string;

    @Prop({ type: { _code: String, _country: String } })
    country?: Country;

    @Prop()
    phone?: string;

    @Prop({ default: false })
    isVerified: boolean;

    @Prop({ default: false })
    isActive: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.authenticate = function (
    this: UserDocument,
    password: string
): Promise<boolean> {
    return Promise.resolve(passwordHash.verify(password, this.password));
};

UserSchema.methods.getToken = function (this: UserDocument): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jwt.sign({ sub: this._id, email: this.email, username: this.username }, secret, {
        expiresIn: '24h',
    });
};

UserSchema.pre('save', function (next) {
    if (!this.isModified('password')) return next();
    this.password = passwordHash.generate(this.password);
    next();
});
