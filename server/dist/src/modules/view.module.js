"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const view_controller_1 = require("../controllers/view.controller");
const view_service_1 = require("../services/view.service");
const view_model_1 = require("../models/view.model");
const article_model_1 = require("../models/article.model");
const article_module_1 = require("./article.module");
const notification_service_1 = require("../services/notification.service");
const notification_module_1 = require("./notification.module");
let ViewModule = class ViewModule {
};
exports.ViewModule = ViewModule;
exports.ViewModule = ViewModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: view_model_1.View.name, schema: view_model_1.ViewSchema },
                { name: article_model_1.Article.name, schema: article_model_1.ArticleSchema }
            ]),
            (0, common_1.forwardRef)(() => article_module_1.ArticleModule),
            notification_module_1.NotificationModule,
        ],
        controllers: [view_controller_1.ViewController],
        providers: [view_service_1.ViewService, notification_service_1.NotificationService],
        exports: [mongoose_1.MongooseModule, view_service_1.ViewService],
    })
], ViewModule);
//# sourceMappingURL=view.module.js.map