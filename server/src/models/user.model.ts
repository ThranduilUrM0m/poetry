import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    passwordHash: string;

    @Prop()
    firstName?: string;

    @Prop()
    lastName?: string;

    @Prop()
    city?: string;

    @Prop({ type: { _code: String, _country: String } })
    country?: { _code: string; _country: string };

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

UserSchema.pre<UserDocument>('save', async function (next) {
    // If the password hasn't been modified, skip the hook.
    if (!this.isModified('passwordHash')) return next();

    try {
        // Generate a salt with 12 rounds.
        const salt: string = await bcrypt.genSalt(12);
        // Hash the password using the generated salt.
        const hashedPassword: string = await bcrypt.hash(this.passwordHash, salt);
        // Replace the plain password with the hashed version.
        this.passwordHash = hashedPassword;
        return next();
    } catch (error: unknown) {
        // Cast the caught error to an Error object before passing it along.
        return next(error as Error);
    }
});
