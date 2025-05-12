// src/utils/objectIdGuard.ts
import { Types } from 'mongoose';

/**
 * Type guard: whether `value` is a Mongoose ObjectId instance.
 */
export function isObjectIdInstance(value: unknown): value is Types.ObjectId {
    return value instanceof Types.ObjectId;
}

/**
 * Type guard: whether `value` is a 24-character hex string
 * that round-trips perfectly through ObjectId.
 */
export function isObjectIdString(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    // Quick length/hex check
    if (!Types.ObjectId.isValid(value)) return false;
    // Round-trip check guards against 12-byte non-hex strings, stray whitespace, etc.
    return new Types.ObjectId(value).toHexString() === value;
}

/**
 * General-purpose validator: true if `value` is either
 * a valid ObjectId instance or a valid ObjectId string.
 */
export function isValidObjectId(value: unknown): value is Types.ObjectId | string {
    return isObjectIdInstance(value) || isObjectIdString(value);
}
