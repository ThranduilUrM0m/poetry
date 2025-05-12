"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObjectIdInstance = isObjectIdInstance;
exports.isObjectIdString = isObjectIdString;
exports.isValidObjectId = isValidObjectId;
const mongoose_1 = require("mongoose");
function isObjectIdInstance(value) {
    return value instanceof mongoose_1.Types.ObjectId;
}
function isObjectIdString(value) {
    if (typeof value !== 'string')
        return false;
    if (!mongoose_1.Types.ObjectId.isValid(value))
        return false;
    return new mongoose_1.Types.ObjectId(value).toHexString() === value;
}
function isValidObjectId(value) {
    return isObjectIdInstance(value) || isObjectIdString(value);
}
//# sourceMappingURL=objectIdGuard.js.map