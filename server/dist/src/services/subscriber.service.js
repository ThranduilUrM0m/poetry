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
exports.SubscriberService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const subscriber_model_1 = require("../models/subscriber.model");
let SubscriberService = class SubscriberService {
    constructor(subscriberModel) {
        this.subscriberModel = subscriberModel;
    }
    async ensureTestData() {
        const count = await this.subscriberModel.countDocuments().exec();
        if (count === 0) {
            await this.subscriberModel.create([
                { email: 'test1@example.com', isSubscribed: true },
                { email: 'test2@example.com', isSubscribed: true },
                { email: 'test3@example.com', isSubscribed: true },
            ]);
        }
    }
    async subscribe(email) {
        const normalized = email.trim().toLowerCase();
        const exists = await this.subscriberModel.exists({ email: normalized }).exec();
        if (exists) {
            throw new common_1.BadRequestException('Email already subscribed');
        }
        const subscriber = new this.subscriberModel({
            email: normalized,
            isSubscribed: true,
        });
        return (await subscriber.save()).toObject();
    }
    async unsubscribe(email) {
        const normalized = email.trim().toLowerCase();
        const updated = await this.subscriberModel
            .findOneAndUpdate({ email: normalized }, { isSubscribed: false }, {
            new: true,
            runValidators: true,
            lean: true,
        })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Subscriber with email "${email}" not found`);
        }
        return updated;
    }
    async getAllSubscribers() {
        return this.subscriberModel.find().lean().exec();
    }
    async findByEmail(email) {
        const normalized = email.trim().toLowerCase();
        return this.subscriberModel.findOne({ email: normalized }).lean().exec();
    }
};
exports.SubscriberService = SubscriberService;
exports.SubscriberService = SubscriberService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(subscriber_model_1.Subscriber.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SubscriberService);
//# sourceMappingURL=subscriber.service.js.map