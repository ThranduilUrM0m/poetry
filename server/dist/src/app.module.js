"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const article_module_1 = require("./modules/article.module");
const subscriber_module_1 = require("./modules/subscriber.module");
const contact_module_1 = require("./modules/contact.module");
const comment_module_1 = require("./modules/comment.module");
const view_module_1 = require("./modules/view.module");
const vote_module_1 = require("./modules/vote.module");
const user_module_1 = require("./modules/user.module");
const openai_module_1 = require("./modules/openai.module");
const notification_module_1 = require("./modules/notification.module");
const auth_module_1 = require("./auth/auth.module");
const fonts_module_1 = require("./fonts/fonts.module");
const analytics_module_1 = require("./modules/analytics.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    uri: configService.get('MONGO_URI'),
                }),
                inject: [config_1.ConfigService],
            }),
            article_module_1.ArticleModule,
            analytics_module_1.AnalyticsModule,
            comment_module_1.CommentModule,
            view_module_1.ViewModule,
            vote_module_1.VoteModule,
            subscriber_module_1.SubscriberModule,
            contact_module_1.ContactModule,
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            fonts_module_1.FontsModule,
            openai_module_1.OpenAIModule,
            notification_module_1.NotificationModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map