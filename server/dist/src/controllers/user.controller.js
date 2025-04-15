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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const passport_1 = require("@nestjs/passport");
const user_model_1 = require("../models/user.model");
const user_service_1 = require("../services/user.service");
const dummyData_1 = require("../data/dummyData");
let UserController = class UserController {
    constructor(userService, userModel) {
        this.userService = userService;
        this.userModel = userModel;
    }
    async getProfile(req) {
        if (!req.user || !req.user.userId) {
            throw new common_1.BadRequestException('Invalid user ID from token');
        }
        try {
            const userFromDb = await this.userService.findById(req.user.userId);
            return userFromDb;
        }
        catch (error) {
            const dummyUser = dummyData_1.dummyUsers.find((a) => a._id?.toString() === req.user.userId);
            if (!dummyUser) {
                throw new common_1.NotFoundException('User not found in database or dummy data');
            }
            return dummyUser;
        }
    }
    async getUserById(id) {
        if (!(0, mongoose_2.isValidObjectId)(id)) {
            throw new common_1.BadRequestException('Invalid user ID format');
        }
        const userFromDb = await this.userService.findById(id);
        if (userFromDb) {
            return userFromDb;
        }
        const dummyUser = dummyData_1.dummyUsers.find((a) => a._id?.toString() === id);
        if (!dummyUser) {
            throw new common_1.NotFoundException('User not found');
        }
        return dummyUser;
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserById", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('api/users'),
    __param(1, (0, mongoose_1.InjectModel)(user_model_1.User.name)),
    __metadata("design:paramtypes", [user_service_1.UserService,
        mongoose_2.Model])
], UserController);
//# sourceMappingURL=user.controller.js.map