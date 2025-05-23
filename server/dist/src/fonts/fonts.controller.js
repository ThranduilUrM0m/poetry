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
exports.FontsController = void 0;
const common_1 = require("@nestjs/common");
const fonts_service_1 = require("./fonts.service");
let FontsController = class FontsController {
    constructor(fontsService) {
        this.fontsService = fontsService;
    }
    async list() {
        return this.fontsService.getFonts();
    }
};
exports.FontsController = FontsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FontsController.prototype, "list", null);
exports.FontsController = FontsController = __decorate([
    (0, common_1.Controller)('fonts'),
    __metadata("design:paramtypes", [fonts_service_1.FontsService])
], FontsController);
//# sourceMappingURL=fonts.controller.js.map