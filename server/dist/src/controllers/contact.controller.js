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
exports.ContactController = exports.MailService = exports.ContactFormDto = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const google_auth_library_1 = require("google-auth-library");
const dotenv = require("dotenv");
const notification_service_1 = require("../services/notification.service");
const notification_gateway_1 = require("../gateways/notification.gateway");
dotenv.config();
class ContactFormDto {
}
exports.ContactFormDto = ContactFormDto;
let MailService = class MailService {
    constructor() {
        this.clientId = process.env.GMAIL_CLIENT_ID ?? '';
        this.clientSecret = process.env.GMAIL_CLIENT_SECRET ?? '';
        this.redirectUri = process.env.GMAIL_REDIRECT_URI ?? '';
        this.refreshToken = process.env.GMAIL_REFRESH_TOKEN ?? '';
        this.gmailUser = process.env.GMAIL_USER ?? '';
        if (!this.clientId ||
            !this.clientSecret ||
            !this.redirectUri ||
            !this.refreshToken ||
            !this.gmailUser) {
            throw new common_1.InternalServerErrorException('Missing GMail OAuth2 configuration in environment');
        }
        this.oauth2Client = new google_auth_library_1.OAuth2Client(this.clientId, this.clientSecret, this.redirectUri);
        this.oauth2Client.setCredentials({ refresh_token: this.refreshToken });
    }
    async createTransporter() {
        const accessTokenResponse = await this.oauth2Client.getAccessToken();
        const accessToken = accessTokenResponse.token;
        if (!accessToken) {
            throw new common_1.InternalServerErrorException('Unable to retrieve GMail access token');
        }
        const auth = {
            type: 'OAuth2',
            user: this.gmailUser,
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            refreshToken: this.refreshToken,
            accessToken,
        };
        return nodemailer.createTransport({
            service: 'gmail',
            auth,
        });
    }
    async sendContactForm(form) {
        const transporter = await this.createTransporter();
        const mailOptions = {
            from: `"${form.firstname} ${form.lastname}" <${form.email}>`,
            to: this.gmailUser,
            subject: 'New Contact Form Submission',
            text: [
                `First Name: ${form.firstname}`,
                `Last Name:  ${form.lastname}`,
                `Email:      ${form.email}`,
                `Phone:      ${form.phone}`,
                '',
                'Message:',
                form.message,
            ].join('\n'),
        };
        await transporter.sendMail(mailOptions);
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
let ContactController = class ContactController {
    constructor(mailService, notificationService, notificationGateway) {
        this.mailService = mailService;
        this.notificationService = notificationService;
        this.notificationGateway = notificationGateway;
    }
    async sendContactEmail(data) {
        try {
            const result = await this.mailService.sendContactForm(data);
            await this.notificationService.create({
                category: 'contact',
                action: 'sent',
                title: 'New Contact Message',
                message: `Contact message from "${data.firstname} ${data.lastname}" <${data.email}>`,
                metadata: {
                    email: data.email,
                    firstname: data.firstname,
                    lastname: data.lastname,
                    phone: data.phone,
                    message: data.message,
                },
            });
            this.notificationGateway.server.emit('contact:sent', {
                type: 'sent',
                contact: {
                    email: data.email,
                    firstname: data.firstname,
                    lastname: data.lastname,
                    phone: data.phone,
                    message: data.message,
                },
            });
            return { message: 'Email sent successfully' };
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error sending email';
            throw new common_1.InternalServerErrorException(`Failed to send contact email: ${msg}`);
        }
    }
};
exports.ContactController = ContactController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ContactFormDto]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "sendContactEmail", null);
exports.ContactController = ContactController = __decorate([
    (0, common_1.Controller)('api/contact'),
    __metadata("design:paramtypes", [MailService,
        notification_service_1.NotificationService,
        notification_gateway_1.NotificationGateway])
], ContactController);
//# sourceMappingURL=contact.controller.js.map