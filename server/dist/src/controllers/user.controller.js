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
const passport_1 = require("@nestjs/passport");
const user_service_1 = require("../services/user.service");
const dummyData_1 = require("../data/dummyData");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async getProfile(req) {
        const userId = req.user?.userId;
        if (!userId || typeof userId !== 'string') {
            throw new common_1.BadRequestException('Invalid user ID in token');
        }
        try {
            const userDoc = await this.userService.findById(userId);
            const { passwordHash, ...safe } = userDoc.toObject();
            return safe;
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException) {
                const dummy = dummyData_1.dummyUsers.find((u) => u._id.toString() === userId);
                if (dummy) {
                    const { passwordHash, ...safeDummy } = dummy;
                    return safeDummy;
                }
            }
            throw err;
        }
    }
    async getById(id) {
        try {
            const userDoc = await this.userService.findById(id);
            const { passwordHash, ...safe } = userDoc.toObject();
            return safe;
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException ||
                err instanceof common_1.BadRequestException) {
                const dummy = dummyData_1.dummyUsers.find((u) => u._id.toString() === id);
                if (dummy) {
                    const { passwordHash, ...safeDummy } = dummy;
                    return safeDummy;
                }
            }
            throw err;
        }
    }
    async getAll(req) {
        const users = await this.userService.getAll();
        return users.map((u) => {
            const { passwordHash, ...safe } = u;
            return safe;
        });
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
], UserController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAll", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('api/users'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map