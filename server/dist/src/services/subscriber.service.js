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
        const count = await this.subscriberModel.countDocuments();
        if (count === 0) {
            console.log('Adding test subscribers...');
            await this.subscriberModel.create([
                { email: 'test1@example.com', isSubscribed: true },
                { email: 'test2@example.com', isSubscribed: true },
                { email: 'test3@example.com', isSubscribed: true }
            ]);
        }
    }
    async subscribe(email) {
        const existingSubscriber = await this.subscriberModel.findOne({ email }).exec();
        if (existingSubscriber) {
            throw new Error('Email already subscribed');
        }
        const subscriber = new this.subscriberModel({ email });
        return subscriber.save();
    }
    async getAllSubscribers() {
        try {
            const subscribers = await this.subscriberModel.find().exec();
            console.log(`Found ${subscribers.length} subscribers`);
            return subscribers;
        }
        catch (error) {
            console.error('Error fetching subscribers:', error);
            throw new Error('Failed to fetch subscribers');
        }
    }
    async getSubscriberBySlug(email) {
        const subscriber = await this.subscriberModel.findOne({ email });
        if (!subscriber)
            throw new common_1.NotFoundException('Subscriber not found');
        return subscriber;
    }
    async findBySlug(email) {
        return this.subscriberModel.findOne({ email }).exec();
    }
    async unsubscribe(email) {
        const subscriber = await this.subscriberModel
            .findOneAndUpdate({ email }, { isSubscribed: false }, { new: true })
            .exec();
        if (!subscriber)
            throw new common_1.NotFoundException('Article not found');
        return subscriber;
    }
};
exports.SubscriberService = SubscriberService;
exports.SubscriberService = SubscriberService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(subscriber_model_1.Subscriber.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SubscriberService);
//# sourceMappingURL=subscriber.service.js.map