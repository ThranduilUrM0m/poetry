"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_model_1 = require("../models/user.model");
let AuthService = class AuthService {
    constructor(userModel, jwtService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
    }
    async validateUser(identifier, password) {
        const user = await this.userModel.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isValid = await user.authenticate(password);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid password');
        }
        const { password: _, ...result } = user.toObject();
        return result;
    }
    async login(identifier, password) {
        const userDoc = await this.validateUser(identifier, password);
        const token = this.jwtService.sign({
            sub: userDoc._id,
            email: userDoc.email,
            username: userDoc.username,
        });
        return {
            user: userDoc,
            access_token: token,
        };
    }
    async register(userData) {
        const { email, username, password } = userData;
        if (!email || !username || !password) {
            throw new common_1.BadRequestException('Missing required fields');
        }
        const existingUser = await this.userModel.findOne({
            $or: [{ email }, { username }],
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Email or username already exists');
        }
        const newUser = new this.userModel(userData);
        await newUser.save();
        const { password: _, ...result } = newUser.toObject();
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_model_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map