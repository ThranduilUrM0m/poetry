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
exports.FontsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let FontsService = class FontsService {
    constructor(http) {
        this.http = http;
        this.API_URL = 'https://www.googleapis.com/webfonts/v1/webfonts';
    }
    async getFonts() {
        const key = process.env.GOOGLE_FONTS_API_KEY;
        const response = await (0, rxjs_1.firstValueFrom)(this.http.get(this.API_URL, {
            params: { key, sort: 'alpha' },
        }));
        return response.data.items.map((item) => item.family);
    }
};
exports.FontsService = FontsService;
exports.FontsService = FontsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], FontsService);
//# sourceMappingURL=fonts.service.js.map