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
exports.OpenAIController = void 0;
const common_1 = require("@nestjs/common");
const openai_service_1 = require("../services/openai.service");
let OpenAIController = class OpenAIController {
    constructor(openai) {
        this.openai = openai;
    }
    async analyzeComment(dto) {
        if (!dto.text || typeof dto.text !== 'string') {
            throw new common_1.HttpException('Invalid payload: text is required', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.openai.analyzeComment(dto);
    }
    async suggestTags(dto) {
        if (!dto.input ||
            !dto.content ||
            typeof dto.input !== 'string' ||
            typeof dto.content !== 'string') {
            throw new common_1.HttpException('Invalid payload: input and content are required', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.openai.suggestTags(dto);
    }
};
exports.OpenAIController = OpenAIController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OpenAIController.prototype, "analyzeComment", null);
__decorate([
    (0, common_1.Post)('suggest-tags'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OpenAIController.prototype, "suggestTags", null);
exports.OpenAIController = OpenAIController = __decorate([
    (0, common_1.Controller)('api/analyze-comment'),
    __metadata("design:paramtypes", [openai_service_1.OpenAIService])
], OpenAIController);
//# sourceMappingURL=openai.controller.js.map