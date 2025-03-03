import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; // NestJS decorators for MongoDB schema
import { Document } from 'mongoose'; // Mongoose Document type for TypeScript support
import * as jwt from 'jsonwebtoken'; // JSON Web Token for authentication
import * as passwordHash from 'password-hash'; // Password hashing utility

// Create a custom type that combines User class with Mongoose Document
export type UserDocument = User & Document;

interface Country {
    _code: string; // Country code (e.g., 'MA')
    _country: string; // Country name (e.g., 'Morocco')
}

// Define User schema using decorators
@Schema({ timestamps: true }) // Add timestamps option here
export class User {
    // Required fields with unique constraints
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password: string;

    // Optional user profile fields
    @Prop()
    firstName?: string;

    @Prop()
    lastName?: string;

    @Prop()
    city?: string;

    @Prop({ type: { _code: String, _country: String } }) // Define the structure of the country object
    country?: Country;

    @Prop()
    phone?: string;

    // Account status flags with default values
    @Prop({ default: false })
    isVerified: boolean;

    @Prop({ default: false })
    isActive: boolean;

    // Timestamp fields will be automatically managed by Mongoose
    createdAt?: Date;
    updatedAt?: Date;
}

// Create Mongoose schema from the User class
export const UserSchema = SchemaFactory.createForClass(User);

// Add instance method to authenticate user
// This method verifies if the provided password matches the stored hash
UserSchema.methods.authenticate = function (
    this: UserDocument,
    password: string
): Promise<boolean> {
    return Promise.resolve(passwordHash.verify(password, this.password));
};

// Add instance method to generate JWT token
// This method creates a signed token containing user information
UserSchema.methods.getToken = function (this: UserDocument): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jwt.sign(
        {
            sub: this._id, // Subject (user ID)
            email: this.email,
            username: this.username,
        },
        secret,
        { expiresIn: '24h' } // Token expires in 24 hours
    );
};

// Mongoose middleware: Hash password before saving
// Only runs if password field has been modified
UserSchema.pre('save', function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = passwordHash.generate(this.password);
    next();
});
