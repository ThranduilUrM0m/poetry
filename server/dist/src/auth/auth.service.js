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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const user_service_1 = require("../services/user.service");
const dummyData_1 = require("../data/dummyData");
const mongoose_1 = require("mongoose");
let AuthService = class AuthService {
    constructor(userService, jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async validateUser(login, pass) {
        let user = await this.userService.findByLogin(login);
        if (!user) {
            const dummyUser = dummyData_1.dummyUsers.find((u) => (u.email && u.email.toLowerCase() === login.toLowerCase()) ||
                (u.username && u.username.toLowerCase() === login.toLowerCase()));
            if (!dummyUser) {
                throw new common_1.UnauthorizedException('User not found in database or fallback data.');
            }
            if (!dummyUser.passwordHash) {
                throw new common_1.UnauthorizedException('Invalid credentials: password hash is missing.');
            }
            const matches = await bcrypt.compare(pass, dummyUser.passwordHash);
            if (!matches) {
                throw new common_1.UnauthorizedException('Invalid credentials: password does not match (fallback).');
            }
            const safeDummy = { ...dummyUser };
            delete safeDummy.passwordHash;
            return safeDummy;
        }
        const matches = await bcrypt.compare(pass, user.passwordHash);
        if (!matches) {
            throw new common_1.UnauthorizedException('Invalid credentials: password does not match.');
        }
        const safeUser = user.toObject();
        delete safeUser.passwordHash;
        return safeUser;
    }
    async validateUserById(id) {
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        let user = await this.userService.findById(id);
        if (!user) {
            const dummyUser = dummyData_1.dummyUsers.find((u) => u._id.toString() === id);
            if (!dummyUser) {
                throw new common_1.NotFoundException('User not found by ID');
            }
            const safeDummy = { ...dummyUser };
            delete safeDummy.passwordHash;
            return safeDummy;
        }
        const safeUser = user.toObject();
        delete safeUser.passwordHash;
        return safeUser;
    }
    async login(user) {
        const payload = { sub: user._id, email: user.email };
        return { access_token: this.jwtService.sign(payload) };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map